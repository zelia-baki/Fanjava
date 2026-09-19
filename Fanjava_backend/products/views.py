# products/views.py

from django.db import transaction
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from users.permissions import is_admin

from .image_response import image_file_response
from .models import Categorie, Produit, ImageProduit, Avis
from .permissions import IsEntrepriseOwnerOrAdminOrReadOnly, IsAdminUser
from .serializers import (
    CategorieSerializer,
    ProduitSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
    ProduitCreateUpdateSerializer,
    ImageProduitSerializer,
    AvisSerializer,
    AvisCreateSerializer,
    AvisUpdateSerializer,
    AvisModerationSerializer,
)
from .validators import valider_image


class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        """
        Les catégories sont publiques en lecture
        Seuls les admins peuvent créer/modifier/supprimer
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticatedOrReadOnly]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filtrer les catégories actives pour les utilisateurs normaux"""
        queryset = super().get_queryset().annotate(nombre_produits=Count('produits'))

        if is_admin(self.request.user):
            return queryset

        return queryset.filter(active=True)

    @action(
        detail=True,
        methods=['get'],
        url_path='image',
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def image(self, request, slug=None):
        """Renvoie l'image de la catégorie en binaire"""
        categorie = self.get_object()
        return image_file_response(categorie.image)

    def destroy(self, request, *args, **kwargs):
        """Empêcher la suppression si la catégorie contient des produits"""
        categorie = self.get_object()

        nombre_produits = categorie.produits.count()

        if nombre_produits > 0:
            return Response(
                {
                    'error': f'Impossible de supprimer cette catégorie car elle contient {nombre_produits} produit(s).',
                    'detail': "Veuillez d'abord déplacer ou supprimer tous les produits de cette catégorie.",
                    'nombre_produits': nombre_produits
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_destroy(categorie)
        return Response(
            {'message': 'Catégorie supprimée avec succès'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, methods=['get'])
    def produits(self, request, slug=None):
        """Produits d'une catégorie (les brouillons/inactifs ne sont visibles que des admins)"""
        categorie = self.get_object()
        produits = categorie.produits.prefetch_related('images')
        if not is_admin(request.user):
            produits = produits.filter(status='active', actif=True)

        serializer = ProduitListSerializer(produits, many=True, context={'request': request})

        return Response({
            'categorie': categorie.nom,
            'nombre_produits': produits.count(),
            'produits': serializer.data
        })


class ImageProduitViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lecture des images de produits (les écritures passent par les actions
    `ajouter_image` / `supprimer_image` du produit, qui vérifient le propriétaire).
    """
    queryset = ImageProduit.objects.all()
    serializer_class = ImageProduitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrer par produit si spécifié"""
        queryset = super().get_queryset()
        produit_id = self.request.query_params.get('produit', None)
        if produit_id:
            queryset = queryset.filter(produit_id=produit_id)
        return queryset

    @action(
        detail=True,
        methods=['get'],
        url_path='blob',
        permission_classes=[AllowAny],
        authentication_classes=[],
    )
    def blob(self, request, pk=None):
        """Renvoie le contenu binaire de l'image (pas d'URL vers /media/)"""
        image = self.get_object()
        return image_file_response(image.image)


ACTIONS_PUBLIQUES = {'list', 'retrieve', 'nouveautes', 'promotions', 'vedette', 'avis'}


class ProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les produits avec upload d'images
    """
    queryset = Produit.objects.select_related('categorie', 'entreprise').prefetch_related('images')
    permission_classes = [IsEntrepriseOwnerOrAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'entreprise', 'status', 'en_promotion', 'en_vedette', 'actif']
    search_fields = ['nom', 'description', 'description_courte']
    ordering_fields = ['prix', 'created_at', 'nom', 'note_moyenne', 'nombre_ventes']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Utiliser des serializers différents selon l'action"""
        if self.action == 'list':
            return ProduitListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProduitCreateUpdateSerializer
        elif self.action == 'retrieve':
            return ProduitDetailSerializer
        return ProduitSerializer

    def get_queryset(self):
        """
        Visibilité :
        - public : produits actifs uniquement ;
        - entreprise : `?mes_produits=true` renvoie TOUS ses produits (brouillons, inactifs...),
          et elle peut ouvrir ses propres produits non actifs ;
        - admin : voit tout en détail, et en liste avec `?include_inactive=true`.
        """
        queryset = super().get_queryset()
        user = self.request.user
        params = self.request.query_params

        if self.action in ACTIONS_PUBLIQUES:
            entreprise = getattr(user, 'entreprise', None) if user.is_authenticated else None

            if params.get('mes_produits') == 'true' and entreprise is not None:
                queryset = queryset.filter(entreprise=entreprise)
            elif is_admin(user) and (params.get('include_inactive') == 'true' or self.action == 'retrieve'):
                pass
            else:
                visible = Q(status='active', actif=True)
                if entreprise is not None and self.action == 'retrieve':
                    visible |= Q(entreprise=entreprise)
                queryset = queryset.filter(visible)

        # Filtrer par prix min/max
        prix_min = params.get('prix_min', None)
        prix_max = params.get('prix_max', None)

        if prix_min:
            queryset = queryset.filter(prix__gte=prix_min)
        if prix_max:
            queryset = queryset.filter(prix__lte=prix_max)

        # Filtrer par stock disponible
        if params.get('en_stock', None) == 'true':
            queryset = queryset.filter(stock__gt=0)

        return queryset

    # ---------- Outils internes

    @staticmethod
    def _exiger_entreprise_approuvee(user, entreprise):
        """Seules les entreprises approuvées peuvent publier/modifier des produits (sauf admin)"""
        if is_admin(user):
            return
        if entreprise.status != 'approved':
            raise PermissionDenied(
                "Votre entreprise doit être approuvée par l'administration pour gérer des produits."
            )

    @staticmethod
    def _extraire_images(request):
        """Récupère et VALIDE les fichiers image_0, image_1... (vrais formats image, 10 Mo max)"""
        images = []
        index = 0
        while f'image_{index}' in request.FILES:
            fichier = request.FILES[f'image_{index}']
            try:
                valider_image(fichier)
            except ValidationError as exc:
                raise ValidationError({f'image_{index}': exc.detail})
            images.append(fichier)
            index += 1
        return images

    # ---------- CRUD

    def retrieve(self, request, *args, **kwargs):
        """Incrémenter le nombre de vues (sauf pour le propriétaire et les admins)"""
        instance = self.get_object()
        entreprise = getattr(request.user, 'entreprise', None) if request.user.is_authenticated else None
        if not is_admin(request.user) and not (entreprise and entreprise.id == instance.entreprise_id):
            instance.nombre_vues += 1
            instance.save(update_fields=['nombre_vues'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Créer un produit avec gestion des images multiples"""
        if not hasattr(request.user, 'entreprise'):
            raise PermissionDenied("Seules les entreprises peuvent créer des produits")
        entreprise = request.user.entreprise
        self._exiger_entreprise_approuvee(request.user, entreprise)

        images = self._extraire_images(request)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            produit = serializer.save(entreprise=entreprise, status='active')
            for index, image_file in enumerate(images):
                ImageProduit.objects.create(
                    produit=produit,
                    image=image_file,
                    est_principale=(index == 0),  # La première image est principale
                    ordre=index
                )

        headers = self.get_success_headers(serializer.data)
        product_serializer = ProduitDetailSerializer(produit, context={'request': request})
        return Response(product_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Mettre à jour un produit (propriétaire ou admin, vérifié par les permissions)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        self._exiger_entreprise_approuvee(request.user, instance.entreprise)

        images = self._extraire_images(request)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            produit = serializer.save()

            if images:
                existing_count = produit.images.count()
                for index, image_file in enumerate(images):
                    ImageProduit.objects.create(
                        produit=produit,
                        image=image_file,
                        est_principale=(existing_count == 0 and index == 0),
                        ordre=existing_count + index
                    )

        product_serializer = ProduitDetailSerializer(produit, context={'request': request})
        return Response(product_serializer.data)

    def perform_destroy(self, instance):
        """
        Supprime le produit ; s'il figure dans des commandes, il est seulement
        désactivé afin de conserver l'historique des commandes.
        """
        if instance.lignecommande_set.exists():
            instance.status = 'inactive'
            instance.actif = False
            instance.save(update_fields=['status', 'actif', 'updated_at'])
        else:
            instance.delete()

    @action(detail=False, methods=['get'])
    def nouveautes(self, request):
        """Récupérer les nouveaux produits (20 derniers)"""
        produits = self.get_queryset().filter(actif=True, status='active')[:20]
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def promotions(self, request):
        """Récupérer les produits en promotion"""
        produits = self.get_queryset().filter(en_promotion=True, actif=True, status='active')
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def vedette(self, request):
        """Récupérer les produits en vedette"""
        produits = self.get_queryset().filter(en_vedette=True, actif=True, status='active')
        serializer = ProduitListSerializer(produits, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def ajouter_image(self, request, slug=None):
        """Ajouter une image à un produit (propriétaire ou admin)"""
        produit = self.get_object()  # applique la permission « propriétaire »
        self._exiger_entreprise_approuvee(request.user, produit.entreprise)

        serializer = ImageProduitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(produit=produit)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def supprimer_image(self, request, slug=None):
        """Supprimer une image d'un produit (propriétaire ou admin)"""
        produit = self.get_object()  # applique la permission « propriétaire »
        image_id = request.data.get('image_id')

        try:
            image = ImageProduit.objects.get(id=image_id, produit=produit)
        except (ImageProduit.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Image non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def avis(self, request, slug=None):
        """Récupérer tous les avis approuvés d'un produit"""
        produit = self.get_object()
        avis = produit.avis.filter(approuve=True).select_related('client__user')
        serializer = AvisSerializer(avis, many=True, context={'request': request})
        return Response({
            'note_moyenne': produit.get_note_moyenne(),
            'nombre_avis': produit.get_nombre_avis(),
            'avis': serializer.data
        })


class AvisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les avis produits
    """
    serializer_class = AvisSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Public : avis approuvés. Un client voit aussi ses propres avis, une entreprise
        ceux de ses produits (pour les modérer), un admin voit tout.
        """
        user = self.request.user
        params = self.request.query_params
        queryset = Avis.objects.select_related('client__user', 'produit')

        if params.get('produit'):
            queryset = queryset.filter(produit_id=params['produit'])

        entreprise = getattr(user, 'entreprise', None) if user.is_authenticated else None
        client = getattr(user, 'client', None) if user.is_authenticated else None

        if params.get('mes_produits') == 'true' and entreprise is not None:
            queryset = queryset.filter(produit__entreprise=entreprise)
        if params.get('client_id') and is_admin(user):
            queryset = queryset.filter(client_id=params['client_id'])

        if is_admin(user):
            return queryset

        visible = Q(approuve=True)
        if client is not None:
            visible |= Q(client=client)
        if entreprise is not None:
            visible |= Q(produit__entreprise=entreprise)
        return queryset.filter(visible)

    def get_serializer_class(self):
        if self.action == 'create':
            return AvisCreateSerializer
        return AvisSerializer

    def create(self, request, *args, **kwargs):
        """Un client (ayant acheté et reçu le produit) laisse un avis"""
        if not hasattr(request.user, 'client'):
            raise PermissionDenied("Seuls les clients peuvent laisser des avis")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        avis = serializer.save(client=request.user.client)
        return Response(AvisSerializer(avis, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        - l'auteur modifie note / titre / commentaire ;
        - l'admin ou l'entreprise du produit approuve / rejette (champ `approuve`).
        """
        partial = kwargs.pop('partial', False)
        avis = self.get_object()
        user = request.user

        client = getattr(user, 'client', None)
        auteur = client is not None and avis.client_id == client.id
        entreprise = getattr(user, 'entreprise', None)
        moderateur = is_admin(user) or (entreprise is not None and avis.produit.entreprise_id == entreprise.id)

        if moderateur and 'approuve' in request.data:
            serializer = AvisModerationSerializer(avis, data=request.data, partial=True)
        elif auteur:
            serializer = AvisUpdateSerializer(avis, data=request.data, partial=partial)
        else:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres avis'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AvisSerializer(avis, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        """Suppression de son propre avis (ou par un admin)"""
        avis = self.get_object()
        client = getattr(request.user, 'client', None)
        auteur = client is not None and avis.client_id == client.id
        if not (auteur or is_admin(request.user)):
            return Response(
                {'error': 'Vous ne pouvez supprimer que vos propres avis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_avis(self, request):
        """Récupérer tous les avis de l'utilisateur connecté"""
        if not hasattr(request.user, 'client'):
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        avis = Avis.objects.filter(client=request.user.client).select_related('client__user', 'produit')
        serializer = AvisSerializer(avis, many=True, context={'request': request})
        return Response(serializer.data)

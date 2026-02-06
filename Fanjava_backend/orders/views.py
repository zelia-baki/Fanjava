from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from collections import defaultdict

from .models import Panier, PanierItem, Commande, LigneCommande
from .serializers import (
    PanierSerializer, 
    CommandeSerializer,
    CommandeCreateSerializer
)
from products.models import Produit


class PanierViewSet(viewsets.ViewSet):
    """ViewSet pour gérer le panier du client"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Récupérer le panier de l'utilisateur connecté"""
        client = request.user.client
        panier, created = Panier.objects.get_or_create(client=client)
        serializer = PanierSerializer(panier)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Ajouter un produit au panier"""
        client = request.user.client
        panier, created = Panier.objects.get_or_create(client=client)
        
        produit_id = request.data.get('produit_id')
        quantite = request.data.get('quantite', 1)
        
        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            return Response(
                {'error': 'Produit non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier le stock
        if produit.stock < quantite:
            return Response(
                {'error': f'Stock insuffisant. Stock disponible: {produit.stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ajouter ou mettre à jour l'article
        item, created = PanierItem.objects.get_or_create(
            panier=panier,
            produit=produit,
            defaults={'quantite': quantite}
        )
        
        if not created:
            nouvelle_quantite = item.quantite + quantite
            if produit.stock < nouvelle_quantite:
                return Response(
                    {'error': f'Stock insuffisant. Stock disponible: {produit.stock}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantite = nouvelle_quantite
            item.save()
        
        serializer = PanierSerializer(panier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@action(detail=False, methods=['patch'])
def update(self, request, *args, **kwargs):
  
    commande = self.get_object()
    
    # DEBUG - LOGS
    print("=" * 60)
    print("📥 DONNÉES REÇUES:", request.data)
    print("🔑 User:", request.user.username)
    print("🏢 Has entreprise:", hasattr(request.user, 'entreprise'))
    print("=" * 60)
    
    # Vérifier que c'est bien l'entreprise de la commande
    if hasattr(request.user, 'entreprise'):
        if commande.entreprise != request.user.entreprise:
            return Response(
                {'error': 'Vous ne pouvez pas modifier cette commande'},
                status=status.HTTP_403_FORBIDDEN
            )
    elif not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'Non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Mettre à jour la commande
    serializer = self.get_serializer(commande, data=request.data, partial=True)
    
    # DEBUG - AFFICHER LES ERREURS
    if not serializer.is_valid():
        print("❌ ERREURS DU SERIALIZER:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    print("✅ COMMANDE MISE À JOUR AVEC SUCCÈS")
    
    return Response(serializer.data)
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Supprimer un article du panier"""
        client = request.user.client
        panier = get_object_or_404(Panier, client=client)
        
        item_id = request.data.get('item_id')
        item = get_object_or_404(PanierItem, id=item_id, panier=panier)
        item.delete()
        
        serializer = PanierSerializer(panier)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Vider le panier"""
        client = request.user.client
        panier = get_object_or_404(Panier, client=client)
        panier.items.all().delete()
        
        serializer = PanierSerializer(panier)
        return Response(serializer.data)


class CommandeViewSet(viewsets.ModelViewSet):  # ← CHANGÉ DE ReadOnlyModelViewSet à ModelViewSet
    """ViewSet pour gérer les commandes"""
    permission_classes = [IsAuthenticated]
    serializer_class = CommandeSerializer
    
    def get_queryset(self):
        """
        Retourner les commandes selon le type d'utilisateur
        - Client : ses propres commandes
        - Entreprise : commandes reçues
        - Admin : toutes les commandes
        """
        user = self.request.user
        
        # Si c'est un client
        if hasattr(user, 'client'):
            return Commande.objects.filter(
                client=user.client
            ).prefetch_related('lignes')
        
        # Si c'est une entreprise
        elif hasattr(user, 'entreprise'):
            return Commande.objects.filter(
                entreprise=user.entreprise
            ).prefetch_related('lignes', 'client__user')
        
        # Si c'est un admin
        elif user.is_staff or user.is_superuser:
            return Commande.objects.all().prefetch_related('lignes', 'client__user')
        
        return Commande.objects.none()
    
    def update(self, request, *args, **kwargs):
        """
        Permettre la mise à jour du statut (entreprise uniquement)
        """
        commande = self.get_object()
        
        # Vérifier que c'est bien l'entreprise de la commande
        if hasattr(request.user, 'entreprise'):
            if commande.entreprise != request.user.entreprise:
                return Response(
                    {'error': 'Vous ne pouvez pas modifier cette commande'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mettre à jour la commande
        serializer = self.get_serializer(commande, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Permettre les mises à jour partielles (PATCH)"""
        return self.update(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Créer une ou plusieurs commandes depuis le panier (une par entreprise)"""
        client = request.user.client
        panier = get_object_or_404(Panier, client=client)
        
        # Vérifier que le panier n'est pas vide
        if not panier.items.exists():
            return Response(
                {'error': 'Le panier est vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Valider les données d'adresse
        create_serializer = CommandeCreateSerializer(data=request.data)
        if not create_serializer.is_valid():
            return Response(
                create_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = create_serializer.validated_data
        
        # Regrouper les items du panier par entreprise
        items_par_entreprise = defaultdict(list)
        
        for item in panier.items.all():
            entreprise = item.produit.entreprise
            items_par_entreprise[entreprise].append(item)
        
        # Transaction atomique pour créer toutes les commandes
        try:
            with transaction.atomic():
                commandes_creees = []
                
                # Créer une commande pour chaque entreprise
                for entreprise, items in items_par_entreprise.items():
                    # Calculer le montant total pour cette entreprise
                    montant_total = sum(item.get_prix_total() for item in items)
                    
                    # Créer la commande
                    commande = Commande.objects.create(
                        client=client,
                        entreprise=entreprise,
                        montant_total=montant_total,
                        frais_livraison=validated_data['frais_livraison'],
                        adresse_livraison=validated_data['adresse_livraison'],
                        ville_livraison=validated_data['ville_livraison'],
                        code_postal_livraison=validated_data['code_postal_livraison'],
                        pays_livraison=validated_data['pays_livraison'],
                        telephone_livraison=validated_data['telephone_livraison'],
                        note_client=validated_data.get('note_client', ''),
                    )
                    
                    # Créer les lignes de commande et décrémenter le stock
                    for item in items:
                        # Vérifier le stock disponible
                        if item.produit.stock < item.quantite:
                            raise Exception(
                                f"Stock insuffisant pour {item.produit.nom}. "
                                f"Stock disponible: {item.produit.stock}"
                            )
                        
                        # Créer la ligne de commande
                        LigneCommande.objects.create(
                            commande=commande,
                            produit=item.produit,
                            nom_produit=item.produit.nom,
                            prix_unitaire=item.produit.get_prix_final(),
                            quantite=item.quantite
                        )
                        
                        # Décrémenter le stock
                        item.produit.stock -= item.quantite
                        item.produit.nombre_ventes += item.quantite
                        item.produit.save()
                    
                    commandes_creees.append(commande)
                
                # Vider le panier après création des commandes
                panier.items.all().delete()
                
                # Sérialiser toutes les commandes créées
                serializer = CommandeSerializer(commandes_creees, many=True)
                
                return Response({
                    'message': f'{len(commandes_creees)} commande(s) créée(s) avec succès',
                    'commandes': serializer.data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
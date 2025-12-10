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


class CommandeViewSet(viewsets.ModelViewSet):
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
        """Créer une ou plusieurs commandes depuis le panier frontend (localStorage)"""
        
        print("=" * 60)
        print("🚀 DÉBUT create_from_cart")
        print(f"👤 User: {request.user.username}")
        print(f"📦 Request data: {request.data}")
        
        # Vérifier si l'utilisateur a un profil client
        if not hasattr(request.user, 'client'):
            print("❌ ERREUR: Utilisateur n'a pas de profil client!")
            return Response(
                {'error': 'Vous devez être un client pour passer commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        client = request.user.client
        print(f"✅ Client trouvé: {client}")
        
        # Valider les données
        create_serializer = CommandeCreateSerializer(data=request.data)
        if not create_serializer.is_valid():
            print(f"❌ ERREUR validation: {create_serializer.errors}")
            return Response(
                create_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = create_serializer.validated_data
        cart_items = validated_data.pop('items')  # Récupérer les items du panier
        
        print(f"📊 Nombre d'items reçus: {len(cart_items)}")
        
        # Vérifier que le panier n'est pas vide
        if not cart_items:
            print("❌ ERREUR: Panier vide!")
            return Response(
                {'error': 'Le panier est vide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Regrouper les items par entreprise
        items_par_entreprise = defaultdict(list)
        
        for cart_item in cart_items:
            try:
                produit = Produit.objects.select_related('entreprise').get(
                    id=cart_item['produit_id']
                )
                print(f"  📦 Produit: {produit.nom} x{cart_item['quantite']}")
                
                items_par_entreprise[produit.entreprise].append({
                    'produit': produit,
                    'quantite': cart_item['quantite']
                })
            except Produit.DoesNotExist:
                print(f"❌ ERREUR: Produit {cart_item['produit_id']} non trouvé!")
                return Response(
                    {'error': f"Produit {cart_item['produit_id']} non trouvé"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        print(f"🏢 Nombre d'entreprises: {len(items_par_entreprise)}")
        
        # Transaction atomique pour créer toutes les commandes
        try:
            with transaction.atomic():
                commandes_creees = []
                
                # Créer une commande pour chaque entreprise
                for entreprise, items in items_par_entreprise.items():
                    print(f"\n🏢 Création commande pour: {entreprise.nom_entreprise}")
                    
                    # Calculer le montant total pour cette entreprise
                    montant_total = sum(
                        item['produit'].get_prix_final() * item['quantite'] 
                        for item in items
                    )
                    print(f"💰 Montant total: {montant_total}")
                    
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
                    
                    print(f"✅ Commande créée: {commande.numero_commande}")
                    
                    # Créer les lignes de commande et décrémenter le stock
                    for item in items:
                        produit = item['produit']
                        quantite = item['quantite']
                        
                        # Vérifier le stock disponible
                        if produit.stock < quantite:
                            raise Exception(
                                f"Stock insuffisant pour {produit.nom}. "
                                f"Stock disponible: {produit.stock}"
                            )
                        
                        # Créer la ligne de commande
                        LigneCommande.objects.create(
                            commande=commande,
                            produit=produit,
                            nom_produit=produit.nom,
                            prix_unitaire=produit.get_prix_final(),
                            quantite=quantite
                        )
                        
                        # Décrémenter le stock
                        produit.stock -= quantite
                        produit.nombre_ventes += quantite
                        produit.save()
                        
                        print(f"  ✅ Ligne créée: {produit.nom}")
                    
                    commandes_creees.append(commande)
                
                # Sérialiser toutes les commandes créées
                serializer = CommandeSerializer(commandes_creees, many=True)
                
                print(f"✅ {len(commandes_creees)} commande(s) créée(s) avec succès")
                print("=" * 60)
                
                return Response({
                    'message': f'{len(commandes_creees)} commande(s) créée(s) avec succès',
                    'commandes': serializer.data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"❌ ERREUR TRANSACTION: {str(e)}")
            print("=" * 60)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
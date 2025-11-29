# orders/models.py

from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from users.models import Client, Entreprise
from products.models import Produit
import random
import string


class Panier(models.Model):
    """
    Panier d'achat du client
    """
    
    client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name='panier',
        verbose_name=_("Client")
    )
    session_key = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Session (utilisateur non connecté)")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Date de modification")
    )
    
    class Meta:
        verbose_name = _("Panier")
        verbose_name_plural = _("Paniers")
    
    def __str__(self):
        return f"Panier de {self.client.user.username}"
    
    def get_total(self):
        """Calcule le montant total du panier"""
        total = sum(item.get_prix_total() for item in self.items.all())
        return total
    
    def get_nombre_items(self):
        """Retourne le nombre total d'articles"""
        return sum(item.quantite for item in self.items.all())


class PanierItem(models.Model):
    """
    Articles dans le panier
    """
    
    panier = models.ForeignKey(
        Panier,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_("Panier")
    )
    produit = models.ForeignKey(
        Produit,
        on_delete=models.CASCADE,
        verbose_name=_("Produit")
    )
    quantite = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name=_("Quantité")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date d'ajout")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Date de modification")
    )
    
    class Meta:
        verbose_name = _("Article panier")
        verbose_name_plural = _("Articles panier")
        unique_together = ['panier', 'produit']
    
    def __str__(self):
        return f"{self.quantite}x {self.produit.nom}"
    
    def get_prix_total(self):
        """Calcule le prix total pour cet article"""
        return self.produit.get_prix_final() * self.quantite


class Commande(models.Model):
    """
    Commandes clients
    """
    
    STATUS_CHOICES = (
        ('pending', _('En attente')),
        ('confirmed', _('Confirmée')),
        ('processing', _('En préparation')),
        ('shipped', _('Expédiée')),
        ('delivered', _('Livrée')),
        ('cancelled', _('Annulée')),
        ('refunded', _('Remboursée')),
    )
    
    # Relations
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='commandes',
        verbose_name=_("Client")
    )
    entreprise = models.ForeignKey(
        Entreprise,
        on_delete=models.CASCADE,
        related_name='commandes',
        verbose_name=_("Entreprise")
    )
    
    # Numéro de commande unique
    numero_commande = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name=_("Numéro de commande")
    )
    
    # Montants
    montant_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Montant total")
    )
    frais_livraison = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name=_("Frais de livraison")
    )
    montant_final = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Montant final")
    )
    
    # Adresse de livraison
    adresse_livraison = models.TextField(
        verbose_name=_("Adresse de livraison")
    )
    ville_livraison = models.CharField(
        max_length=100,
        verbose_name=_("Ville de livraison")
    )
    code_postal_livraison = models.CharField(
        max_length=10,
        verbose_name=_("Code postal")
    )
    pays_livraison = models.CharField(
        max_length=100,
        verbose_name=_("Pays de livraison")
    )
    telephone_livraison = models.CharField(
        max_length=20,
        verbose_name=_("Téléphone de livraison")
    )
    
    # Statut et suivi
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_("Statut")
    )
    numero_suivi = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Numéro de suivi")
    )
    
    # Notes
    note_client = models.TextField(
        blank=True,
        verbose_name=_("Note du client")
    )
    note_entreprise = models.TextField(
        blank=True,
        verbose_name=_("Note de l'entreprise (interne)")
    )
    
    # Dates
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Date de modification")
    )
    date_livraison_estimee = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date de livraison estimée")
    )
    date_livraison_reelle = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date de livraison réelle")
    )
    
    class Meta:
        verbose_name = _("Commande")
        verbose_name_plural = _("Commandes")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['numero_commande']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['entreprise', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Commande #{self.numero_commande}"
    
    def save(self, *args, **kwargs):
        if not self.numero_commande:
            # Générer un numéro de commande unique
            self.numero_commande = self.generer_numero_commande()
        
        # Calculer montant final
        self.montant_final = self.montant_total + self.frais_livraison
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generer_numero_commande():
        """Génère un numéro de commande unique"""
        prefix = 'CMD'
        random_string = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        return f"{prefix}{random_string}"


class LigneCommande(models.Model):
    """
    Lignes de commande (produits dans une commande)
    """
    
    commande = models.ForeignKey(
        Commande,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name=_("Commande")
    )
    produit = models.ForeignKey(
        Produit,
        on_delete=models.PROTECT,
        verbose_name=_("Produit")
    )
    
    # Détails au moment de la commande (snapshot)
    nom_produit = models.CharField(
        max_length=200,
        verbose_name=_("Nom du produit")
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix unitaire")
    )
    quantite = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name=_("Quantité")
    )
    prix_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix total")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Ligne de commande")
        verbose_name_plural = _("Lignes de commande")
    
    def __str__(self):
        return f"{self.quantite}x {self.nom_produit}"
    
    def save(self, *args, **kwargs):
        # Sauvegarder le nom du produit au moment de la commande
        if not self.nom_produit:
            self.nom_produit = self.produit.nom
        
        # Calculer le prix total
        self.prix_total = self.prix_unitaire * self.quantite
        
        super().save(*args, **kwargs)
# products/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from users.models import Entreprise, Client


class Categorie(models.Model):
    """
    Catégories de produits (hiérarchiques)
    """
    
    nom = models.CharField(
        max_length=100, 
        unique=True,
        verbose_name=_("Nom")
    )
    slug = models.SlugField(
        max_length=100, 
        unique=True,
        verbose_name=_("Slug")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    image = models.ImageField(
        upload_to='categories/', 
        blank=True, 
        null=True,
        verbose_name=_("Image")
    )
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='sous_categories',
        verbose_name=_("Catégorie parente")
    )
    
    ordre = models.IntegerField(
        default=0,
        verbose_name=_("Ordre d'affichage")
    )
    active = models.BooleanField(
        default=True,
        verbose_name=_("Active")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Catégorie")
        verbose_name_plural = _("Catégories")
        ordering = ['ordre', 'nom']
    
    def __str__(self):
        return self.nom
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)


class Produit(models.Model):
    """
    Produits mis en vente par les entreprises
    """
    
    STATUS_CHOICES = (
        ('draft', _('Brouillon')),
        ('active', _('Actif')),
        ('inactive', _('Inactif')),
        ('out_of_stock', _('Rupture de stock')),
    )
    
    entreprise = models.ForeignKey(
        Entreprise, 
        on_delete=models.CASCADE, 
        related_name='produits',
        verbose_name=_("Entreprise")
    )
    categorie = models.ForeignKey(
        Categorie, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='produits',
        verbose_name=_("Catégorie")
    )
    
    # Informations principales
    nom = models.CharField(
        max_length=200,
        verbose_name=_("Nom")
    )
    slug = models.SlugField(
        max_length=200, 
        unique=True,
        verbose_name=_("Slug")
    )
    description = models.TextField(
        verbose_name=_("Description")
    )
    description_courte = models.CharField(
        max_length=500, 
        blank=True,
        verbose_name=_("Description courte")
    )
    
    # Prix et stock
    prix = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix")
    )
    prix_promo = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_("Prix promotionnel")
    )
    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Stock")
    )
    seuil_alerte_stock = models.IntegerField(
        default=10,
        validators=[MinValueValidator(0)],
        verbose_name=_("Seuil d'alerte stock")
    )
    
    # Caractéristiques
    sku = models.CharField(
        max_length=100, 
        unique=True, 
        blank=True,
        verbose_name=_("SKU (Code produit)")
    )
    poids = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_("Poids (kg)")
    )
    
    # Visibilité et statut
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        verbose_name=_("Statut")
    )
    en_vedette = models.BooleanField(
        default=False,
        verbose_name=_("Produit en vedette")
    )
    
    # Statistiques
    nombre_vues = models.IntegerField(
        default=0,
        verbose_name=_("Nombre de vues")
    )
    nombre_ventes = models.IntegerField(
        default=0,
        verbose_name=_("Nombre de ventes")
    )
    note_moyenne = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_("Note moyenne")
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
        verbose_name = _("Produit")
        verbose_name_plural = _("Produits")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['entreprise', 'status']),
            models.Index(fields=['categorie']),
            models.Index(fields=['en_vedette']),
        ]
    
    def __str__(self):
        return self.nom
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        
        # Générer SKU automatiquement si vide
        if not self.sku:
            import random
            import string
            self.sku = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        super().save(*args, **kwargs)
    
    def get_prix_final(self):
        """Retourne le prix à afficher (promo si existe, sinon prix normal)"""
        if self.prix_promo and self.prix_promo < self.prix:
            return self.prix_promo
        return self.prix
    
    def stock_faible(self):
        """Vérifie si le stock est en dessous du seuil d'alerte"""
        return self.stock <= self.seuil_alerte_stock
    
    def en_rupture(self):
        """Vérifie si le produit est en rupture de stock"""
        return self.stock == 0
    def get_note_moyenne(self):
        """Calcule la note moyenne du produit"""
        from django.db.models import Avg
        result = self.avis.filter(approuve=True).aggregate(Avg('note'))
        return round(result['note__avg'], 1) if result['note__avg'] else 0
    
    def get_nombre_avis(self):
        """Retourne le nombre d'avis approuvés"""
        return self.avis.filter(approuve=True).count()


class ImageProduit(models.Model):
    """
    Images des produits (plusieurs images par produit)
    """
    
    produit = models.ForeignKey(
        Produit, 
        on_delete=models.CASCADE, 
        related_name='images',
        verbose_name=_("Produit")
    )
    image = models.ImageField(
        upload_to='produits/',
        verbose_name=_("Image")
    )
    alt_text = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name=_("Texte alternatif")
    )
    est_principale = models.BooleanField(
        default=False,
        verbose_name=_("Image principale")
    )
    ordre = models.IntegerField(
        default=0,
        verbose_name=_("Ordre d'affichage")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Image produit")
        verbose_name_plural = _("Images produits")
        ordering = ['ordre', '-est_principale']
    
    def __str__(self):
        return f"Image de {self.produit.nom}"
    
    def save(self, *args, **kwargs):
        # Si marquée comme principale, retirer le flag des autres images
        if self.est_principale:
            ImageProduit.objects.filter(
                produit=self.produit, 
                est_principale=True
            ).update(est_principale=False)
        super().save(*args, **kwargs)


class Avis(models.Model):
    """
    Avis clients sur les produits
    """
    
    produit = models.ForeignKey(
        Produit, 
        on_delete=models.CASCADE, 
        related_name='avis',
        verbose_name=_("Produit")
    )
    client = models.ForeignKey(
        Client, 
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name=_("Client")
    )
    
    note = models.IntegerField(
        choices=[(i, f'{i} étoile{"s" if i > 1 else ""}') for i in range(1, 6)],
        verbose_name=_("Note")
    )
    titre = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name=_("Titre")
    )
    commentaire = models.TextField(
        verbose_name=_("Commentaire")
    )
    
    # Modération
    approuve = models.BooleanField(
        default=True,
        verbose_name=_("Approuvé")
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
        verbose_name = _("Avis")
        verbose_name_plural = _("Avis")
        ordering = ['-created_at']
        # Un client ne peut laisser qu'un seul avis par produit
        unique_together = ['produit', 'client']
        indexes = [
            models.Index(fields=['produit', 'approuve']),
        ]
    
    def __str__(self):
        return f"Avis de {self.client.user.username} sur {self.produit.nom} ({self.note}/5)"
    
class Avis(models.Model):
    """
    Avis clients sur les produits
    """
    
    # Relations
    produit = models.ForeignKey(
        Produit,
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name=_("Produit")
    )
    client = models.ForeignKey(
        'users.Client',
        on_delete=models.CASCADE,
        related_name='avis',
        verbose_name=_("Client")
    )
    
    # Contenu de l'avis
    note = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Note (1-5)")
    )
    commentaire = models.TextField(
        verbose_name=_("Commentaire")
    )
    
    # Statut
    approuve = models.BooleanField(
        default=True,
        verbose_name=_("Approuvé")
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
    
    class Meta:
        verbose_name = _("Avis")
        verbose_name_plural = _("Avis")
        ordering = ['-created_at']
        unique_together = ['produit', 'client']  # Un client ne peut laisser qu'un seul avis par produit
        indexes = [
            models.Index(fields=['produit', 'approuve']),
            models.Index(fields=['client']),
        ]
    
    def __str__(self):
        return f"Avis de {self.client.user.username} sur {self.produit.nom} - {self.note}/5"
# users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    """
    Modèle utilisateur personnalisé avec types de compte
    """
    
    USER_TYPE_CHOICES = (
        ('client', _('Client')),
        ('entreprise', _('Entreprise')),
        ('admin', _('Administrateur')),
    )
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES,
        verbose_name=_("Type d'utilisateur")
    )
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message=_("Le numéro de téléphone doit être au format: '+999999999'. Jusqu'à 15 chiffres autorisés.")
    )
    phone = models.CharField(
        validators=[phone_regex], 
        max_length=20, 
        blank=True,
        verbose_name=_("Téléphone")
    )
    
    email_verified = models.BooleanField(
        default=False,
        verbose_name=_("Email vérifié")
    )
    
    # Préférence de langue
    preferred_language = models.CharField(
        max_length=5,
        choices=[
            ('fr', _('Français')),
            ('en', _('English')),
            ('mg', _('Malagasy')),
            ('es', _('Español')),
            ('de', _('Deutsch')),
        ],
        default='fr',
        verbose_name=_("Langue préférée")
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
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Entreprise(models.Model):
    """
    Profil entreprise/vendeur
    """
    
    STATUS_CHOICES = (
        ('pending', _('En attente')),
        ('approved', _('Approuvé')),
        ('rejected', _('Rejeté')),
        ('suspended', _('Suspendu')),
    )
    
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='entreprise',
        verbose_name=_("Utilisateur")
    )
    
    # Informations de base
    nom_entreprise = models.CharField(
        max_length=200,
        verbose_name=_("Nom de l'entreprise")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Description")
    )
    logo = models.ImageField(
        upload_to='entreprises/logos/', 
        blank=True, 
        null=True,
        verbose_name=_("Logo")
    )
    
    # Informations légales
    siret = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True,
        verbose_name=_("SIRET")
    )
    adresse = models.TextField(
        verbose_name=_("Adresse")
    )
    ville = models.CharField(
        max_length=100,
        verbose_name=_("Ville")
    )
    code_postal = models.CharField(
        max_length=10,
        verbose_name=_("Code postal")
    )
    pays = models.CharField(
        max_length=100, 
        default='Madagascar',
        verbose_name=_("Pays")
    )
    
    # Contact
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message=_("Le numéro de téléphone doit être au format: '+999999999'.")
    )
    telephone = models.CharField(
        validators=[phone_regex],
        max_length=20,
        verbose_name=_("Téléphone")
    )
    email_entreprise = models.EmailField(
        verbose_name=_("Email entreprise")
    )
    whatsapp = models.CharField(
        validators=[phone_regex],
        max_length=20, 
        blank=True,
        verbose_name=_("WhatsApp")
    )
    
    # Statut et vérification
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name=_("Statut")
    )
    verified = models.BooleanField(
        default=False,
        verbose_name=_("Vérifié")
    )
    verification_date = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name=_("Date de vérification")
    )
    
    # Statistiques
    note_moyenne = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        verbose_name=_("Note moyenne")
    )
    nombre_ventes = models.IntegerField(
        default=0,
        verbose_name=_("Nombre de ventes")
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
        verbose_name = _("Entreprise")
        verbose_name_plural = _("Entreprises")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['verified']),
        ]
    
    def __str__(self):
        return self.nom_entreprise


class Client(models.Model):
    """
    Profil client/acheteur
    """
    
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='client',
        verbose_name=_("Utilisateur")
    )
    
    # Adresse de livraison par défaut
    adresse_livraison = models.TextField(
        blank=True,
        verbose_name=_("Adresse de livraison")
    )
    ville = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name=_("Ville")
    )
    code_postal = models.CharField(
        max_length=10, 
        blank=True,
        verbose_name=_("Code postal")
    )
    pays = models.CharField(
        max_length=100, 
        default='Madagascar',
        verbose_name=_("Pays")
    )
    
    # Préférences
    newsletter = models.BooleanField(
        default=False,
        verbose_name=_("S'abonner à la newsletter")
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
        verbose_name = _("Client")
        verbose_name_plural = _("Clients")
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Client: {self.user.username}"
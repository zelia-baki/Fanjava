# payments/models.py

from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from orders.models import Commande


class Paiement(models.Model):
    """
    Transactions de paiement
    """
    
    STATUS_CHOICES = (
        ('pending', _('En attente')),
        ('completed', _('Complété')),
        ('failed', _('Échoué')),
        ('refunded', _('Remboursé')),
    )
    
    METHOD_CHOICES = (
        ('card', _('Carte bancaire')),
        ('paypal', _('PayPal')),
        ('stripe', _('Stripe')),
        ('transfer', _('Virement bancaire')),
        ('cash', _('Espèces')),
        ('mobile_money', _('Mobile Money')),
    )
    
    commande = models.OneToOneField(
        Commande,
        on_delete=models.CASCADE,
        related_name='paiement',
        verbose_name=_("Commande")
    )
    
    # Détails du paiement
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Montant")
    )
    methode = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        verbose_name=_("Méthode de paiement")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_("Statut")
    )
    
    # Informations de transaction
    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("ID de transaction")
    )
    
    # Réponse du provider (Stripe, PayPal, etc.)
    provider_response = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Réponse du provider")
    )
    
    # Message d'erreur en cas d'échec
    error_message = models.TextField(
        blank=True,
        verbose_name=_("Message d'erreur")
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
        verbose_name = _("Paiement")
        verbose_name_plural = _("Paiements")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Paiement #{self.id} - Commande #{self.commande.numero_commande} - {self.get_status_display()}"
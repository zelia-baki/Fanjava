# notifications/models.py

from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import CustomUser


class Notification(models.Model):
    """
    Notifications pour les utilisateurs
    """
    
    TYPE_CHOICES = (
        ('order', _('Nouvelle commande')),
        ('order_status', _('Changement de statut commande')),
        ('stock', _('Alerte stock')),
        ('payment', _('Paiement')),
        ('review', _('Nouvel avis')),
        ('account', _('Compte')),
        ('general', _('Général')),
    )
    
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("Utilisateur")
    )
    
    type_notification = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name=_("Type de notification")
    )
    titre = models.CharField(
        max_length=200,
        verbose_name=_("Titre")
    )
    message = models.TextField(
        verbose_name=_("Message")
    )
    lien = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Lien")
    )
    
    # Métadonnées (optionnel, pour stocker des infos supplémentaires)
    metadata = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Métadonnées")
    )
    
    # Statut
    lue = models.BooleanField(
        default=False,
        verbose_name=_("Lue")
    )
    date_lecture = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Date de lecture")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'lue']),
            models.Index(fields=['type_notification']),
        ]
    
    def __str__(self):
        return f"{self.titre} - {self.user.username}"
    
    def marquer_comme_lue(self):
        """Marque la notification comme lue"""
        from django.utils import timezone
        self.lue = True
        self.date_lecture = timezone.now()
        self.save()
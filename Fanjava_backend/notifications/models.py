# notifications/models.py - NOUVELLE ARCHITECTURE

from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import CustomUser


class Notification(models.Model):
    """
    Notification globale créée par l'admin
    UNE SEULE instance même pour 1 million d'utilisateurs
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
    
    RECIPIENT_TYPE_CHOICES = (
        ('all', _('Tous les utilisateurs')),
        ('clients', _('Clients uniquement')),
        ('entreprises', _('Entreprises uniquement')),
        ('specific', _('Utilisateurs spécifiques')),
    )
    
    # Créateur de la notification (généralement admin)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='notifications_created',
        verbose_name=_("Créé par")
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
    
    # Destinataires
    recipient_type = models.CharField(
        max_length=20,
        choices=RECIPIENT_TYPE_CHOICES,
        default='all',
        verbose_name=_("Type de destinataires")
    )
    
    # Pour les envois spécifiques, stocker les IDs
    specific_recipients = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_("Destinataires spécifiques"),
        help_text=_("Liste des IDs utilisateurs pour envoi spécifique")
    )
    
    # Statut
    active = models.BooleanField(
        default=True,
        verbose_name=_("Active"),
        help_text=_("Désactiver pour retirer la notification de tous les utilisateurs")
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
            models.Index(fields=['recipient_type']),
            models.Index(fields=['active', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.titre} ({self.recipient_type})"
    
    def is_for_user(self, user):
        """Vérifie si cette notification est destinée à cet utilisateur"""
        # L'admin qui crée ne reçoit pas sa propre notification
        if self.created_by and self.created_by.id == user.id:
            return False
        
        # Vérifier le type de destinataire
        if self.recipient_type == 'all':
            return True
        elif self.recipient_type == 'clients':
            return user.user_type == 'client'
        elif self.recipient_type == 'entreprises':
            return user.user_type == 'entreprise'
        elif self.recipient_type == 'specific':
            return user.id in (self.specific_recipients or [])
        
        return False
    
    def get_recipient_count(self):
        """Nombre total de destinataires"""
        if self.recipient_type == 'all':
            count = CustomUser.objects.exclude(id=self.created_by_id).count()
        elif self.recipient_type == 'clients':
            count = CustomUser.objects.filter(user_type='client').count()
        elif self.recipient_type == 'entreprises':
            count = CustomUser.objects.filter(user_type='entreprise').count()
        elif self.recipient_type == 'specific':
            count = len(self.specific_recipients or [])
        else:
            count = 0
        return count


class NotificationStatus(models.Model):
    """
    Statut de lecture/suppression pour chaque utilisateur
    Permet de garder l'historique
    """
    
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='user_statuses',
        verbose_name=_("Notification")
    )
    
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notification_statuses',
        verbose_name=_("Utilisateur")
    )
    
    # Statut de lecture
    lue = models.BooleanField(
        default=False,
        verbose_name=_("Lue")
    )
    
    date_lecture = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Date de lecture")
    )
    
    # Statut de suppression (masquée pour l'utilisateur)
    supprimee = models.BooleanField(
        default=False,
        verbose_name=_("Supprimée"),
        help_text=_("Masquée pour l'utilisateur mais conservée en base")
    )
    
    date_suppression = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Date de suppression")
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date de création")
    )
    
    class Meta:
        verbose_name = _("Statut de notification")
        verbose_name_plural = _("Statuts de notification")
        unique_together = [['notification', 'user']]
        indexes = [
            models.Index(fields=['user', 'lue', 'supprimee']),
            models.Index(fields=['notification', 'user']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.notification.titre}"
    
    def marquer_comme_lue(self):
        """Marque comme lue"""
        from django.utils import timezone
        if not self.lue:
            self.lue = True
            self.date_lecture = timezone.now()
            self.save()
    
    def masquer(self):
        """Masque la notification pour l'utilisateur (soft delete)"""
        from django.utils import timezone
        if not self.supprimee:
            self.supprimee = True
            self.date_suppression = timezone.now()
            self.save()
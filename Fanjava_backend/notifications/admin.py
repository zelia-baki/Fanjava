# notifications/admin.py - VERSION V2

from django.contrib import admin
from .models import Notification, NotificationStatus


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Administration des notifications globales"""
    
    list_display = [
        'id',
        'titre',
        'type_notification',
        'recipient_type',
        'created_by',
        'active',
        'created_at',
        'recipient_count_display'
    ]
    
    list_filter = [
        'type_notification',
        'recipient_type',
        'active',
        'created_at'
    ]
    
    search_fields = [
        'titre',
        'message',
        'created_by__username',
        'created_by__email'
    ]
    
    readonly_fields = [
        'created_at',
        'recipient_count_display',
        'read_count_display'
    ]
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('titre', 'message', 'type_notification', 'lien')
        }),
        ('Destinataires', {
            'fields': ('recipient_type', 'specific_recipients')
        }),
        ('Statut', {
            'fields': ('active', 'created_by')
        }),
        ('Statistiques', {
            'fields': ('recipient_count_display', 'read_count_display', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def recipient_count_display(self, obj):
        """Afficher le nombre de destinataires"""
        return obj.get_recipient_count()
    recipient_count_display.short_description = 'Nombre de destinataires'
    
    def read_count_display(self, obj):
        """Afficher le nombre de lectures"""
        return NotificationStatus.objects.filter(notification=obj, lue=True).count()
    read_count_display.short_description = 'Nombre de lectures'
    
    def save_model(self, request, obj, form, change):
        """Enregistrer le créateur si c'est une nouvelle notification"""
        if not change:  # Si c'est une nouvelle notification
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(NotificationStatus)
class NotificationStatusAdmin(admin.ModelAdmin):
    """Administration des statuts de notification par utilisateur"""
    
    list_display = [
        'id',
        'notification',
        'user',
        'lue',
        'supprimee',
        'date_lecture',
        'date_suppression',
        'created_at'
    ]
    
    list_filter = [
        'lue',
        'supprimee',
        'created_at',
        'date_lecture'
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'notification__titre'
    ]
    
    readonly_fields = [
        'created_at',
        'date_lecture',
        'date_suppression'
    ]
    
    fieldsets = (
        ('Relations', {
            'fields': ('notification', 'user')
        }),
        ('Statut', {
            'fields': ('lue', 'supprimee')
        }),
        ('Dates', {
            'fields': ('date_lecture', 'date_suppression', 'created_at')
        }),
    )
    
    def has_add_permission(self, request):
        """Empêcher la création manuelle de statuts"""
        return False
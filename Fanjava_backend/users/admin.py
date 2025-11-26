# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Entreprise, Client

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'email_verified', 'is_staff']
    list_filter = ['user_type', 'email_verified', 'is_staff']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('user_type', 'phone', 'email_verified', 'preferred_language')
        }),
    )

@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    list_display = ['nom_entreprise', 'user', 'status', 'verified', 'note_moyenne', 'nombre_ventes']
    list_filter = ['status', 'verified']
    search_fields = ['nom_entreprise', 'siret']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('user', 'nom_entreprise', 'logo')
        }),
        ('Description', {
            'fields': ('description', 'description_en', 'description_mg', 'description_es', 'description_de')
        }),
        ('Coordonnées', {
            'fields': ('siret', 'adresse', 'ville', 'code_postal', 'pays', 'telephone', 'email', 'whatsapp')
        }),
        ('Statut', {
            'fields': ('status', 'verified', 'verified_at')
        }),
        ('Statistiques', {
            'fields': ('note_moyenne', 'nombre_ventes'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['note_moyenne', 'nombre_ventes']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['user', 'ville', 'newsletter']
    list_filter = ['newsletter']
    search_fields = ['user__username', 'user__email']
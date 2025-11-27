# products/admin.py
from django.contrib import admin
from .models import Categorie, Produit, ImageProduit, Avis

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'slug', 'parent', 'ordre', 'active']
    list_filter = ['active']
    prepopulated_fields = {'slug': ('nom',)}
    
    # Affiche les champs traduits manuellement
    fields = ['nom', 'nom_en', 'nom_mg', 'nom_es', 'nom_de',
              'description', 'description_en', 'description_mg', 'description_es', 'description_de',
              'slug', 'parent', 'ordre', 'active', 'image']

class ImageProduitInline(admin.TabularInline):
    model = ImageProduit
    extra = 3

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ['nom', 'entreprise', 'categorie', 'prix', 'stock', 'status', 'en_vedette']
    list_filter = ['status', 'en_vedette', 'categorie']
    search_fields = ['nom', 'sku']
    prepopulated_fields = {'slug': ('nom',)}
    inlines = [ImageProduitInline]
    
    # Affiche les champs traduits manuellement
    fieldsets = (
        ('Informations principales', {
            'fields': ('entreprise', 'categorie', 'nom', 'slug')
        }),
        ('Traductions - Nom', {
            'fields': ('nom_en', 'nom_mg', 'nom_es', 'nom_de'),
            'classes': ('collapse',)
        }),
        ('Description', {
            'fields': ('description_courte', 'description')
        }),
        ('Traductions - Description courte', {
            'fields': ('description_courte_en', 'description_courte_mg', 'description_courte_es', 'description_courte_de'),
            'classes': ('collapse',)
        }),
        ('Traductions - Description', {
            'fields': ('description_en', 'description_mg', 'description_es', 'description_de'),
            'classes': ('collapse',)
        }),
        ('Prix et Stock', {
            'fields': ('prix', 'prix_promo', 'stock', 'seuil_alerte_stock', 'sku', 'poids')
        }),
        ('Paramètres', {
            'fields': ('status', 'en_vedette')
        }),
    )

@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ['produit', 'client', 'note', 'approuve', 'created_at']
    list_filter = ['note', 'approuve', 'created_at']
    search_fields = ['produit__nom', 'client__user__username', 'commentaire']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['approuve']
# orders/admin.py
from django.contrib import admin
from .models import Panier, PanierItem, Commande, LigneCommande

class PanierItemInline(admin.TabularInline):
    model = PanierItem
    extra = 0

@admin.register(Panier)
class PanierAdmin(admin.ModelAdmin):
    list_display = ['client', 'created_at']
    inlines = [PanierItemInline]

class LigneCommandeInline(admin.TabularInline):
    model = LigneCommande
    extra = 0

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['numero_commande', 'client', 'entreprise', 'montant_final', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['numero_commande']
    inlines = [LigneCommandeInline]
# payments/admin.py
from django.contrib import admin
from .models import Paiement

@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ['commande', 'montant', 'methode', 'status', 'created_at']
    list_filter = ['status', 'methode']
    search_fields = ['transaction_id', 'commande__numero_commande']
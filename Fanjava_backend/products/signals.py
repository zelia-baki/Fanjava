# products/signals.py
"""Tient à jour les notes moyennes et notifie l'entreprise à chaque nouvel avis."""

from decimal import Decimal

from django.db.models import Avg
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Avis, Produit


def recalculer_notes(produit_id):
    """Recalcule la note moyenne (avis approuvés) du produit ET de son entreprise"""
    from users.models import Entreprise

    produit = Produit.objects.filter(pk=produit_id).only('id', 'entreprise_id').first()
    if produit is None:
        return

    def moyenne(queryset):
        valeur = queryset.aggregate(m=Avg('note'))['m']
        return Decimal(str(round(valeur, 2))) if valeur else Decimal('0.00')

    Produit.objects.filter(pk=produit_id).update(
        note_moyenne=moyenne(Avis.objects.filter(produit_id=produit_id, approuve=True))
    )
    Entreprise.objects.filter(pk=produit.entreprise_id).update(
        note_moyenne=moyenne(Avis.objects.filter(produit__entreprise_id=produit.entreprise_id, approuve=True))
    )


@receiver(post_save, sender=Avis)
def avis_enregistre(sender, instance, created, **kwargs):
    recalculer_notes(instance.produit_id)

    if created:
        from notifications.services import notifier
        produit = instance.produit
        notifier(
            produit.entreprise.user,
            'review',
            'Nouvel avis reçu',
            f"Un client a laissé un avis ({instance.note}/5) sur « {produit.nom} ».",
            lien='/entreprise/reviews',
        )


@receiver(post_delete, sender=Avis)
def avis_supprime(sender, instance, **kwargs):
    recalculer_notes(instance.produit_id)

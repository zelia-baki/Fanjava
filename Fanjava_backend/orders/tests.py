import tempfile
import threading
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from notifications.models import Notification
from orders.models import Commande, Panier, PanierItem
from products.models import ImageProduit
from users.factories import creer_admin, creer_client, creer_entreprise, creer_produit, png_bytes

LIVRAISON = {
    'adresse_livraison': 'Lot 5', 'ville_livraison': 'Tana', 'code_postal_livraison': '101',
    'pays_livraison': 'Madagascar', 'telephone_livraison': '0340000000',
}


class PanierTests(APITestCase):
    def setUp(self):
        self.ent = creer_entreprise()
        self.cli = creer_client()
        self.produit = creer_produit(self.ent, prix=1000, stock=5)
        self.client.force_authenticate(self.cli)

    def ajouter(self, quantite=1, produit=None):
        return self.client.post('/api/orders/panier/add_item/', {'produit_id': (produit or self.produit).id, 'quantite': quantite}, format='json')

    def test_ajout_et_cumul(self):
        self.assertEqual(self.ajouter(2).status_code, 200)
        r = self.ajouter(1)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['nombre_items'], 3)
        self.assertEqual(Decimal(r.json()['total']), Decimal('3000'))

    def test_quantite_negative_ou_nulle_ou_texte_refusee(self):
        for valeur in (-5, 0, 'abc', None):
            r = self.client.post('/api/orders/panier/add_item/', {'produit_id': self.produit.id, 'quantite': valeur}, format='json')
            self.assertEqual(r.status_code, 400, valeur)
        self.assertFalse(PanierItem.objects.exists())

    def test_stock_insuffisant(self):
        self.assertEqual(self.ajouter(6).status_code, 400)
        self.ajouter(4)
        self.assertEqual(self.ajouter(2).status_code, 400)

    def test_produit_inactif_ou_boutique_suspendue_indisponible(self):
        brouillon = creer_produit(self.ent, 'Brouillon', status='draft')
        self.assertEqual(self.ajouter(1, brouillon).status_code, 404)
        boutique = creer_entreprise('suspendue', approuvee=False)
        self.assertEqual(self.ajouter(1, creer_produit(boutique, 'Autre')).status_code, 404)

    def test_modifier_une_quantite(self):
        item_id = self.ajouter(1).json()['items'][0]['id']
        r = self.client.patch('/api/orders/panier/update_item/', {'item_id': item_id, 'quantite': 4}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['nombre_items'], 4)
        self.assertEqual(self.client.patch('/api/orders/panier/update_item/', {'item_id': item_id, 'quantite': 9}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/api/orders/panier/update_item/', {'item_id': item_id, 'quantite': -1}, format='json').status_code, 400)

    def test_retirer_un_article(self):
        item_id = self.ajouter(2).json()['items'][0]['id']
        r = self.client.delete('/api/orders/panier/remove_item/', {'item_id': item_id}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['items'], [])

    def test_vider_le_panier(self):
        self.ajouter(2)
        r = self.client.delete('/api/orders/panier/clear/')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['nombre_items'], 0)

    def test_on_ne_touche_pas_au_panier_des_autres(self):
        item_id = self.ajouter(1).json()['items'][0]['id']
        self.client.force_authenticate(creer_client('voleur'))
        r = self.client.delete('/api/orders/panier/remove_item/', {'item_id': item_id}, format='json')
        self.assertEqual(r.status_code, 404)
        self.assertTrue(PanierItem.objects.filter(pk=item_id).exists())

    def test_entreprise_n_a_pas_de_panier(self):
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.get('/api/orders/panier/').status_code, 403)
        self.assertEqual(self.ajouter(1).status_code, 403)


class CreationCommandeTests(APITestCase):
    def setUp(self):
        self.ent1 = creer_entreprise('vend1')
        self.ent2 = creer_entreprise('vend2')
        self.cli = creer_client()
        self.p1 = creer_produit(self.ent1, 'P1', prix=1000, stock=10, seuil_alerte_stock=3)
        self.p2 = creer_produit(self.ent2, 'P2', prix=500, stock=4)
        self.client.force_authenticate(self.cli)

    def remplir(self, *couples):
        for produit, quantite in couples:
            self.client.post('/api/orders/panier/add_item/', {'produit_id': produit.id, 'quantite': quantite}, format='json')

    def commander(self, **extra):
        return self.client.post('/api/orders/commandes/create_from_cart/', {**LIVRAISON, **extra}, format='json')

    def test_une_commande_par_entreprise_et_stock_decremente(self):
        self.remplir((self.p1, 2), (self.p2, 1))
        r = self.commander()
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(len(r.json()['commandes']), 2)
        self.p1.refresh_from_db(); self.p2.refresh_from_db()
        self.assertEqual((self.p1.stock, self.p1.nombre_ventes), (8, 2))
        self.assertEqual(self.p2.stock, 3)
        self.assertFalse(PanierItem.objects.exists())

    def test_frais_de_livraison_du_client_ignores(self):
        self.remplir((self.p1, 2))
        r = self.commander(frais_livraison='-1500')
        self.assertEqual(r.status_code, 201, r.content)
        commande = r.json()['commandes'][0]
        self.assertEqual(Decimal(commande['montant_total']), Decimal('2000'))
        self.assertEqual(Decimal(commande['frais_livraison']), Decimal('0'))
        self.assertEqual(Decimal(commande['montant_final']), Decimal('2000'))

    def test_lignes_avec_image_et_slug(self):
        image = ImageProduit(produit=self.p1)
        with override_settings(MEDIA_ROOT=tempfile.mkdtemp()):
            image.image.save('a.png', SimpleUploadedFile('a.png', png_bytes()))
        self.remplir((self.p1, 1))
        ligne = self.commander().json()['commandes'][0]['lignes'][0]
        self.assertEqual(ligne['image_principale_id'], image.id)
        self.assertEqual(ligne['produit_slug'], self.p1.slug)

    def test_panier_vide(self):
        self.assertEqual(self.commander().status_code, 400)
        self.remplir((self.p1, 1))
        self.client.delete('/api/orders/panier/clear/')
        self.assertEqual(self.commander().status_code, 400)

    def test_adresse_obligatoire(self):
        self.remplir((self.p1, 1))
        r = self.client.post('/api/orders/commandes/create_from_cart/', {}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_stock_epuise_entre_temps(self):
        self.remplir((self.p1, 5))
        type(self.p1).objects.filter(pk=self.p1.pk).update(stock=2)
        r = self.commander()
        self.assertEqual(r.status_code, 400)
        self.assertIn('Stock insuffisant', r.json()['error'])
        self.assertFalse(Commande.objects.exists())
        self.assertEqual(PanierItem.objects.count(), 1)  # le panier est conservé

    def test_produit_desactive_entre_temps(self):
        self.remplir((self.p1, 1))
        type(self.p1).objects.filter(pk=self.p1.pk).update(actif=False)
        self.assertEqual(self.commander().status_code, 400)
        self.assertFalse(Commande.objects.exists())

    def test_notifications_nouvelle_commande_et_stock_faible(self):
        self.remplir((self.p1, 8))  # 10 -> 2, sous le seuil de 3
        self.commander()
        types = set(Notification.objects.filter(destinataire=self.ent1).values_list('type_notification', flat=True))
        self.assertEqual(types, {'order', 'stock'})

    def test_notification_rupture_de_stock(self):
        self.remplir((self.p2, 4))
        self.commander()
        self.assertTrue(Notification.objects.filter(destinataire=self.ent2, titre='Rupture de stock').exists())

    def test_creation_directe_et_suppression_interdites(self):
        self.remplir((self.p1, 1))
        commande_id = self.commander().json()['commandes'][0]['id']
        self.assertEqual(self.client.post('/api/orders/commandes/', {}, format='json').status_code, 405)
        self.assertEqual(self.client.delete(f'/api/orders/commandes/{commande_id}/').status_code, 405)
        self.assertTrue(Commande.objects.filter(pk=commande_id).exists())

    def test_entreprise_ne_peut_pas_commander(self):
        self.client.force_authenticate(self.ent1)
        self.assertEqual(self.commander().status_code, 403)


class CyclePleinTests(APITestCase):
    """Statuts, annulation, remise en stock, frais de livraison."""

    def setUp(self):
        self.ent = creer_entreprise('vend')
        self.cli = creer_client()
        self.produit = creer_produit(self.ent, prix=1000, stock=10)
        self.client.force_authenticate(self.cli)
        self.client.post('/api/orders/panier/add_item/', {'produit_id': self.produit.id, 'quantite': 3}, format='json')
        r = self.client.post('/api/orders/commandes/create_from_cart/', LIVRAISON, format='json')
        self.commande_id = r.json()['commandes'][0]['id']
        self.url = f'/api/orders/commandes/{self.commande_id}/'

    def patch(self, user, **donnees):
        self.client.force_authenticate(user)
        return self.client.patch(self.url, donnees, format='json')

    def stock(self):
        self.produit.refresh_from_db()
        return self.produit.stock

    def test_client_annule_sa_commande_et_le_stock_revient(self):
        self.assertEqual(self.stock(), 7)
        r = self.client.post(f'{self.url}cancel/')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['status'], 'cancelled')
        self.assertEqual(self.stock(), 10)
        self.produit.refresh_from_db()
        self.assertEqual(self.produit.nombre_ventes, 0)

    def test_annulation_double_ne_remet_pas_le_stock_deux_fois(self):
        self.client.post(f'{self.url}cancel/')
        self.assertEqual(self.client.post(f'{self.url}cancel/').status_code, 400)
        self.assertEqual(self.stock(), 10)

    def test_client_ne_peut_plus_annuler_en_preparation(self):
        self.patch(self.ent, status='confirmed')
        self.patch(self.ent, status='processing')
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.post(f'{self.url}cancel/').status_code, 400)
        self.assertEqual(self.stock(), 7)

    def test_autre_client_ne_peut_pas_annuler(self):
        self.client.force_authenticate(creer_client('intrus'))
        self.assertEqual(self.client.post(f'{self.url}cancel/').status_code, 404)

    def test_client_ne_peut_pas_changer_le_statut(self):
        self.assertEqual(self.patch(self.cli, status='delivered').status_code, 403)

    def test_autre_entreprise_ne_peut_pas_modifier(self):
        self.assertEqual(self.patch(creer_entreprise('autre'), status='confirmed').status_code, 404)

    def test_transitions_autorisees_uniquement(self):
        self.assertEqual(self.patch(self.ent, status='delivered').status_code, 400)  # saute des étapes
        for statut in ('confirmed', 'processing', 'shipped', 'delivered'):
            r = self.patch(self.ent, status=statut)
            self.assertEqual(r.status_code, 200, (statut, r.content))
        self.assertEqual(self.patch(self.ent, status='pending').status_code, 400)  # pas de retour en arrière
        self.assertEqual(self.patch(self.ent, status='cancelled').status_code, 400)

    def test_annulee_est_definitive(self):
        self.patch(self.ent, status='cancelled')
        self.assertEqual(self.stock(), 10)
        self.assertEqual(self.patch(self.ent, status='delivered').status_code, 400)
        self.assertEqual(self.patch(self.ent, status='confirmed').status_code, 400)
        self.assertEqual(self.stock(), 10)

    def test_livraison_renseigne_la_date_et_les_ventes(self):
        for statut in ('confirmed', 'processing', 'shipped', 'delivered'):
            self.patch(self.ent, status=statut)
        commande = Commande.objects.get(pk=self.commande_id)
        self.assertIsNotNone(commande.date_livraison_reelle)
        self.ent.entreprise.refresh_from_db()
        self.assertEqual(self.ent.entreprise.nombre_ventes, 3)

    def test_remboursement_apres_livraison(self):
        for statut in ('confirmed', 'processing', 'shipped', 'delivered', 'refunded'):
            self.assertEqual(self.patch(self.ent, status=statut).status_code, 200, statut)
        self.ent.entreprise.refresh_from_db()
        self.assertEqual(self.ent.entreprise.nombre_ventes, 0)

    def test_le_vendeur_fixe_les_frais_de_livraison(self):
        r = self.patch(self.ent, frais_livraison='2500')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(Decimal(r.json()['montant_final']), Decimal('5500'))
        self.assertEqual(self.patch(self.ent, frais_livraison='-10').status_code, 400)

    def test_frais_figes_apres_expedition(self):
        for statut in ('confirmed', 'processing', 'shipped'):
            self.patch(self.ent, status=statut)
        self.assertEqual(self.patch(self.ent, frais_livraison='100').status_code, 400)

    def test_numero_de_suivi(self):
        r = self.patch(self.ent, numero_suivi='TRK123')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['numero_suivi'], 'TRK123')

    def test_champs_non_modifiables_ignores(self):
        self.patch(self.ent, montant_total='1', adresse_livraison='ailleurs', client=999)
        commande = Commande.objects.get(pk=self.commande_id)
        self.assertEqual(commande.montant_total, Decimal('3000'))
        self.assertEqual(commande.adresse_livraison, 'Lot 5')

    def test_client_notifie_a_chaque_changement(self):
        self.patch(self.ent, status='confirmed')
        self.assertTrue(Notification.objects.filter(destinataire=self.cli, type_notification='order_status').exists())

    def test_statuts_suivants_exposes(self):
        r = self.client.get(self.url)
        self.assertEqual(r.json()['statuts_suivants'], ['confirmed', 'cancelled'])
        self.assertTrue(r.json()['peut_annuler'])

    def test_admin_filtre_par_client_et_entreprise(self):
        self.client.force_authenticate(creer_admin())
        r = self.client.get(f'/api/orders/commandes/?client_id={self.cli.client.id}')
        self.assertEqual(len(r.json()['results']), 1)
        r = self.client.get('/api/orders/commandes/?client_id=99999')
        self.assertEqual(len(r.json()['results']), 0)
        r = self.client.get(f'/api/orders/commandes/?entreprise_id={self.ent.entreprise.id}')
        self.assertEqual(len(r.json()['results']), 1)

    def test_visibilite_des_commandes(self):
        self.client.force_authenticate(creer_client('autre'))
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.get(self.url).status_code, 200)
        self.client.force_authenticate(creer_entreprise('autre2'))
        self.assertEqual(self.client.get(self.url).status_code, 404)

from decimal import Decimal

from rest_framework.test import APITestCase

from notifications.models import Notification
from orders.models import Commande, LigneCommande
from payments.models import Paiement
from users.factories import creer_admin, creer_client, creer_entreprise, creer_produit


class PaiementsTests(APITestCase):
    def setUp(self):
        self.ent = creer_entreprise('vend')
        self.cli = creer_client()
        self.produit = creer_produit(self.ent, prix=1000)
        self.commande = Commande.objects.create(
            client=self.cli.client, entreprise=self.ent.entreprise, montant_total=Decimal('2000'),
            adresse_livraison='a', ville_livraison='v', code_postal_livraison='1',
            pays_livraison='MG', telephone_livraison='1')
        LigneCommande.objects.create(commande=self.commande, produit=self.produit, nom_produit='P',
                                     prix_unitaire=1000, quantite=2)

    def declarer(self, user=None, **extra):
        self.client.force_authenticate(user or self.cli)
        return self.client.post('/api/payments/', {'commande': self.commande.id, 'methode': 'mobile_money',
                                                   'transaction_id': 'MV123', **extra}, format='json')

    def test_le_client_declare_son_paiement_en_attente(self):
        r = self.declarer(montant='1', status='completed')  # montant et statut imposés par le serveur
        self.assertEqual(r.status_code, 201, r.content)
        paiement = Paiement.objects.get()
        self.assertEqual(paiement.status, 'pending')
        self.assertEqual(paiement.montant, Decimal('2000'))
        self.commande.refresh_from_db()
        self.assertEqual(self.commande.status, 'pending')  # rien n'est confirmé automatiquement
        self.assertTrue(Notification.objects.filter(destinataire=self.ent, type_notification='payment').exists())

    def test_un_seul_paiement_actif_par_commande(self):
        self.declarer()
        self.assertEqual(self.declarer().status_code, 400)

    def test_autre_client_ou_entreprise_ne_peuvent_pas_declarer(self):
        self.assertEqual(self.declarer(creer_client('intrus')).status_code, 400)
        self.assertEqual(self.declarer(self.ent).status_code, 403)

    def test_commande_annulee_non_payable(self):
        Commande.objects.filter(pk=self.commande.pk).update(status='cancelled')
        self.assertEqual(self.declarer().status_code, 400)

    def test_l_entreprise_confirme_et_la_commande_est_confirmee(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(self.ent)
        r = self.client.post(f'/api/payments/{paiement.id}/confirm/')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['status'], 'completed')
        self.commande.refresh_from_db()
        self.assertEqual(self.commande.status, 'confirmed')

    def test_le_client_ne_peut_pas_confirmer_son_propre_paiement(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.post(f'/api/payments/{paiement.id}/confirm/').status_code, 403)
        paiement.refresh_from_db()
        self.assertEqual(paiement.status, 'pending')

    def test_autre_entreprise_ne_voit_ni_ne_confirme(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(creer_entreprise('autre'))
        self.assertEqual(self.client.post(f'/api/payments/{paiement.id}/confirm/').status_code, 404)
        self.assertEqual(len(self.client.get('/api/payments/').json()['results']), 0)

    def test_paiement_refuse_puis_redeclare(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(self.ent)
        r = self.client.post(f'/api/payments/{paiement.id}/fail/', {'error_message': 'Référence introuvable'}, format='json')
        self.assertEqual(r.json()['status'], 'failed')
        self.assertEqual(self.declarer(transaction_id='MV999').status_code, 201)
        paiement.refresh_from_db()
        self.assertEqual((paiement.status, paiement.transaction_id), ('pending', 'MV999'))
        self.assertEqual(Paiement.objects.count(), 1)

    def test_remboursement_reserve_a_l_admin(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(self.ent)
        self.client.post(f'/api/payments/{paiement.id}/confirm/')
        self.assertEqual(self.client.post(f'/api/payments/{paiement.id}/refund/').status_code, 403)
        self.client.force_authenticate(creer_admin())
        r = self.client.post(f'/api/payments/{paiement.id}/refund/')
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()['status'], 'refunded')

    def test_remboursement_impossible_si_pas_complete(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.client.force_authenticate(creer_admin())
        self.assertEqual(self.client.post(f'/api/payments/{paiement.id}/refund/').status_code, 400)

    def test_visibilite_par_role(self):
        self.declarer()
        for user, attendu in ((self.cli, 1), (self.ent, 1), (creer_admin(), 1), (creer_client('autre'), 0)):
            self.client.force_authenticate(user)
            self.assertEqual(len(self.client.get('/api/payments/').json()['results']), attendu, user.username)

    def test_detail_et_anonyme(self):
        self.declarer()
        paiement = Paiement.objects.get()
        self.assertEqual(self.client.get(f'/api/payments/{paiement.id}/').status_code, 200)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/api/payments/').status_code, 401)

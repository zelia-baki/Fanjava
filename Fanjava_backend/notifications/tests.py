from rest_framework.test import APITestCase

from notifications.models import Notification
from notifications.services import notifier
from users.factories import creer_admin, creer_client, creer_entreprise

CORPS = {'titre': 'Info', 'message': 'Bonjour', 'type_notification': 'general', 'recipient_type': 'all'}


class NotificationsTests(APITestCase):
    def setUp(self):
        self.admin = creer_admin()
        self.cli = creer_client()
        self.ent = creer_entreprise()

    def test_un_client_ne_peut_pas_creer_de_notification(self):
        self.client.force_authenticate(self.cli)
        for url in ('/api/notifications/', '/api/notifications/create_notification/', '/api/notifications/bulk/'):
            self.assertEqual(self.client.post(url, CORPS, format='json').status_code, 403, url)
        self.assertFalse(Notification.objects.exists())

    def test_anonyme_refuse(self):
        self.assertEqual(self.client.get('/api/notifications/').status_code, 401)

    def test_un_client_ne_peut_ni_modifier_ni_supprimer(self):
        notification = Notification.objects.create(created_by=self.admin, recipient_type='all', titre='t', message='m', type_notification='general')
        self.client.force_authenticate(self.cli)
        # la route de suppression / modification n'existe plus (404) ou est refusée (405)
        self.assertIn(self.client.delete(f'/api/notifications/{notification.id}/').status_code, (404, 405))
        self.assertIn(self.client.patch(f'/api/notifications/{notification.id}/', {'active': False}, format='json').status_code, (404, 405))
        notification.refresh_from_db()
        self.assertTrue(notification.active)

    def test_l_admin_cree_et_gere_ses_notifications(self):
        self.client.force_authenticate(self.admin)
        for url in ('/api/notifications/', '/api/notifications/create_notification/', '/api/notifications/bulk/'):
            r = self.client.post(url, CORPS, format='json')
            self.assertEqual(r.status_code, 201, (url, r.content))
            self.assertEqual(r.json()['created_by'], self.admin.id)
        self.assertEqual(len(self.client.get('/api/notifications/list_admin/').json()), 3)
        notification_id = Notification.objects.first().id
        self.assertEqual(self.client.get(f'/api/notifications/{notification_id}/stats/').status_code, 200)
        r = self.client.patch(f'/api/notifications/{notification_id}/toggle_active/')
        self.assertFalse(r.json()['active'])

    def test_type_reserve_au_systeme_refuse_a_l_admin(self):
        self.client.force_authenticate(self.admin)
        r = self.client.post('/api/notifications/', {**CORPS, 'recipient_type': 'user'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_ciblage_par_type_d_utilisateur(self):
        self.client.force_authenticate(self.admin)
        self.client.post('/api/notifications/', {**CORPS, 'titre': 'Pour clients', 'recipient_type': 'clients'}, format='json')
        self.client.post('/api/notifications/', {**CORPS, 'titre': 'Pour entreprises', 'recipient_type': 'entreprises'}, format='json')
        self.client.post('/api/notifications/', {**CORPS, 'titre': 'Pour tous'}, format='json')

        def titres(user):
            self.client.force_authenticate(user)
            return sorted(n['titre'] for n in self.client.get('/api/notifications/').json())

        self.assertEqual(titres(self.cli), ['Pour clients', 'Pour tous'])
        self.assertEqual(titres(self.ent), ['Pour entreprises', 'Pour tous'])
        self.assertEqual(titres(self.admin), [])  # l'auteur ne reçoit pas sa propre notification

    def test_envoi_specifique(self):
        self.client.force_authenticate(self.admin)
        r = self.client.post('/api/notifications/', {**CORPS, 'recipient_type': 'specific', 'specific_recipients': [self.cli.id]}, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        self.client.force_authenticate(self.cli)
        self.assertEqual(len(self.client.get('/api/notifications/').json()), 1)
        self.client.force_authenticate(self.ent)
        self.assertEqual(len(self.client.get('/api/notifications/').json()), 0)

    def test_notification_automatique_ciblee(self):
        notifier(self.cli, 'order', 'Commande', 'Votre commande', lien='/profile/orders/1')
        self.client.force_authenticate(self.cli)
        donnees = self.client.get('/api/notifications/').json()
        self.assertEqual(len(donnees), 1)
        self.assertEqual(donnees[0]['lien'], '/profile/orders/1')
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.get('/api/notifications/').json(), [])

    def test_lecture_masquage_et_compteur(self):
        notifier(self.cli, 'general', 'A', 'a')
        notifier(self.cli, 'general', 'B', 'b')
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.get('/api/notifications/unread_count/').json()['count'], 2)

        premiere, seconde = [n['id'] for n in self.client.get('/api/notifications/').json()]
        self.assertEqual(self.client.post(f'/api/notifications/{premiere}/mark_read/').status_code, 200)
        self.assertEqual(self.client.get('/api/notifications/unread_count/').json()['count'], 1)
        self.client.post(f'/api/notifications/{premiere}/mark_unread/')
        self.assertEqual(self.client.get('/api/notifications/unread_count/').json()['count'], 2)

        self.assertEqual(self.client.post('/api/notifications/mark_all_read/').json()['count'], 2)
        self.assertEqual(self.client.get('/api/notifications/unread_count/').json()['count'], 0)

        self.assertEqual(self.client.delete(f'/api/notifications/{seconde}/hide/').status_code, 200)
        self.assertEqual(len(self.client.get('/api/notifications/').json()), 1)

    def test_impossible_de_lire_la_notification_d_un_autre(self):
        notifier(self.cli, 'general', 'Privée', 'x')
        notification = Notification.objects.get()
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.post(f'/api/notifications/{notification.id}/mark_read/').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/notifications/{notification.id}/hide/').status_code, 403)

    def test_notification_desactivee_disparait(self):
        self.client.force_authenticate(self.admin)
        notification_id = self.client.post('/api/notifications/', CORPS, format='json').json()['id']
        self.client.patch(f'/api/notifications/{notification_id}/toggle_active/')
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.get('/api/notifications/').json(), [])

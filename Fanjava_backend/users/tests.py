from django.core import mail
from rest_framework.test import APITestCase

from users.emails import (
    email_verification_token,
    encoder_uid,
)
from users.factories import MOT_DE_PASSE, creer_admin, creer_client, creer_entreprise
from users.models import CustomUser, Entreprise

MDP_FORT = 'Zq81!strong_pw_x'


def donnees_inscription(**extra):
    base = {
        'username': 'nouveau', 'email': 'nouveau@test.mg',
        'password': MDP_FORT, 'password2': MDP_FORT,
    }
    base.update(extra)
    return base


class InscriptionTests(APITestCase):
    def test_impossible_de_s_inscrire_comme_admin(self):
        r = self.client.post('/api/users/register/', donnees_inscription(user_type='admin'), format='json')
        self.assertEqual(r.status_code, 400)
        self.assertFalse(CustomUser.objects.filter(username='nouveau').exists())

    def test_inscription_client(self):
        r = self.client.post('/api/users/register/', donnees_inscription(
            user_type='client', client={'adresse_livraison': 'a', 'ville': 'v', 'code_postal': '1'}), format='json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(CustomUser.objects.get(username='nouveau').user_type, 'client')
        # e-mail de vérification envoyé
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/verify-email/', mail.outbox[0].body)

    def _entreprise(self, username, email, siret=''):
        return self.client.post('/api/users/register/', donnees_inscription(
            username=username, email=email, user_type='entreprise',
            entreprise={'nom_entreprise': username, 'siret': siret, 'adresse': 'a', 'ville': 'v',
                        'code_postal': '1', 'telephone': '+261340000001', 'email_entreprise': email}), format='json')

    def test_plusieurs_entreprises_sans_siret(self):
        self.assertEqual(self._entreprise('e1', 'e1@t.mg').status_code, 201)
        self.assertEqual(self._entreprise('e2', 'e2@t.mg').status_code, 201)
        self.assertEqual(Entreprise.objects.filter(siret__isnull=True).count(), 2)

    def test_siret_unique_quand_renseigne(self):
        self.assertEqual(self._entreprise('e1', 'e1@t.mg', siret='123').status_code, 201)
        r = self._entreprise('e2', 'e2@t.mg', siret='123')
        self.assertEqual(r.status_code, 400)
        self.assertIn('siret', r.json()['entreprise'])

    def test_email_deja_utilise_refuse(self):
        creer_client('deja')
        r = self.client.post('/api/users/register/', donnees_inscription(
            email='deja@test.mg', user_type='client', client={'ville': 'v'}), format='json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('email', r.json())

    def test_mot_de_passe_faible_refuse(self):
        r = self.client.post('/api/users/register/', donnees_inscription(
            password='12345678', password2='12345678', user_type='client', client={'ville': 'v'}), format='json')
        self.assertEqual(r.status_code, 400)


class ProfilTests(APITestCase):
    def test_client_ne_peut_pas_se_promouvoir_admin(self):
        user = creer_client()
        self.client.force_authenticate(user)
        r = self.client.patch('/api/users/profile/', {'user_type': 'admin', 'is_active': True}, format='json')
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.user_type, 'client')

    def test_modification_du_profil_client_imbrique(self):
        user = creer_client()
        self.client.force_authenticate(user)
        r = self.client.patch('/api/users/profile/', {'first_name': 'Jean', 'client': {'ville': 'Toamasina'}}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Jean')
        self.assertEqual(user.client.ville, 'Toamasina')

    def test_put_est_traite_comme_partiel(self):
        user = creer_client()
        self.client.force_authenticate(user)
        r = self.client.put('/api/users/profile/', {'first_name': 'Paul'}, format='json')
        self.assertEqual(r.status_code, 200, r.content)

    def test_entreprise_garde_son_siret_lors_d_une_mise_a_jour(self):
        user = creer_entreprise()
        user.entreprise.siret = '999'
        user.entreprise.save()
        self.client.force_authenticate(user)
        r = self.client.patch('/api/users/profile/', {'entreprise': {'siret': '999', 'ville': 'Nosy Be'}}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        user.entreprise.refresh_from_db()
        self.assertEqual(user.entreprise.ville, 'Nosy Be')

    def test_entreprise_ne_peut_pas_s_approuver(self):
        user = creer_entreprise(approuvee=False)
        self.client.force_authenticate(user)
        self.client.patch('/api/users/profile/', {'entreprise': {'status': 'approved', 'verified': True}}, format='json')
        user.entreprise.refresh_from_db()
        self.assertEqual(user.entreprise.status, 'pending')

    def test_changer_email_annule_la_verification(self):
        user = creer_client()
        user.email_verified = True
        user.save()
        self.client.force_authenticate(user)
        self.client.patch('/api/users/profile/', {'email': 'autre@test.mg'}, format='json')
        user.refresh_from_db()
        self.assertFalse(user.email_verified)
        self.assertEqual(len(mail.outbox), 1)


class MotDePasseTests(APITestCase):
    def test_changement_de_mot_de_passe(self):
        user = creer_client()
        self.client.force_authenticate(user)
        r = self.client.post('/api/users/change-password/', {'old_password': 'faux', 'new_password': MDP_FORT}, format='json')
        self.assertEqual(r.status_code, 400)
        r = self.client.post('/api/users/change-password/', {'old_password': MOT_DE_PASSE, 'new_password': MDP_FORT}, format='json')
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password(MDP_FORT))

    def test_reinitialisation_complete(self):
        user = creer_client()
        r = self.client.post('/api/users/password-reset/', {'email': user.email}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        lien = [ligne for ligne in mail.outbox[0].body.splitlines() if '/reset-password/' in ligne][0]
        _, _, reste = lien.partition('/reset-password/')
        uid, token = reste.strip().split('/')[:2]

        r = self.client.post('/api/users/password-reset/confirm/',
                             {'uid': uid, 'token': token, 'new_password': MDP_FORT}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        user.refresh_from_db()
        self.assertTrue(user.check_password(MDP_FORT))

        # le lien ne sert qu'une fois
        r = self.client.post('/api/users/password-reset/confirm/',
                             {'uid': uid, 'token': token, 'new_password': 'Autre!mdp_2026'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_demande_pour_email_inconnu_ne_revele_rien(self):
        r = self.client.post('/api/users/password-reset/', {'email': 'inconnu@test.mg'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_reinitialisation_refuse_mot_de_passe_faible(self):
        user = creer_client()
        self.client.post('/api/users/password-reset/', {'email': user.email}, format='json')
        lien = [ligne for ligne in mail.outbox[0].body.splitlines() if '/reset-password/' in ligne][0]
        uid, token = lien.partition('/reset-password/')[2].strip().split('/')[:2]
        r = self.client.post('/api/users/password-reset/confirm/',
                             {'uid': uid, 'token': token, 'new_password': '123'}, format='json')
        self.assertEqual(r.status_code, 400)


class VerificationEmailTests(APITestCase):
    def test_verification(self):
        user = creer_client()
        uid, token = encoder_uid(user), email_verification_token.make_token(user)
        r = self.client.post('/api/users/verify-email/', {'uid': uid, 'token': token}, format='json')
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)
        # jeton invalide une fois utilisé
        r = self.client.post('/api/users/verify-email/', {'uid': uid, 'token': token}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_jeton_invalide(self):
        user = creer_client()
        r = self.client.post('/api/users/verify-email/', {'uid': encoder_uid(user), 'token': 'x-y'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_renvoi(self):
        user = creer_client()
        self.client.force_authenticate(user)
        r = self.client.post('/api/users/resend-verification/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)


class AdministrationTests(APITestCase):
    def test_reserve_aux_admins(self):
        self.client.force_authenticate(creer_client())
        self.assertEqual(self.client.get('/api/users/admin/users/').status_code, 403)

    def test_admin_liste_les_utilisateurs(self):
        creer_client()
        self.client.force_authenticate(creer_admin())
        r = self.client.get('/api/users/admin/users/')
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

    def test_admin_ne_peut_pas_se_supprimer_ni_se_desactiver(self):
        admin = creer_admin()
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.delete(f'/api/users/admin/users/{admin.id}/').status_code, 400)
        r = self.client.patch(f'/api/users/admin/users/{admin.id}/', {'is_active': False}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_admin_peut_desactiver_un_autre_compte(self):
        cible = creer_client()
        self.client.force_authenticate(creer_admin())
        r = self.client.patch(f'/api/users/admin/users/{cible.id}/', {'is_active': False}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        cible.refresh_from_db()
        self.assertFalse(cible.is_active)

    def test_approbation_entreprise_notifie(self):
        from notifications.models import Notification
        ent = creer_entreprise(approuvee=False)
        self.client.force_authenticate(creer_admin())
        r = self.client.post(f'/api/users/admin/entreprises/{ent.entreprise.id}/approve/')
        self.assertEqual(r.status_code, 200)
        ent.entreprise.refresh_from_db()
        self.assertEqual(ent.entreprise.status, 'approved')
        self.assertTrue(Notification.objects.filter(destinataire=ent, type_notification='account').exists())

    def test_liste_clients_admin_contient_id_et_compte(self):
        creer_client('zoe')
        self.client.force_authenticate(creer_admin())
        r = self.client.get('/api/users/admin/clients/')
        self.assertEqual(r.status_code, 200)
        premier = (r.json().get('results') or r.json())[0]
        self.assertIn('id', premier)
        self.assertEqual(premier['username'], 'zoe')

    def test_admin_django_page_entreprise_s_ouvre(self):
        from django.test import Client as DjangoClient
        admin = creer_admin('superadm')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        ent = creer_entreprise()
        c = DjangoClient()
        c.force_login(admin)
        r = c.get(f'/admin/users/entreprise/{ent.entreprise.id}/change/', HTTP_HOST='localhost')
        self.assertEqual(r.status_code, 200)

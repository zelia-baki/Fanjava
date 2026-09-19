import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from orders.models import Commande, LigneCommande
from products.models import Avis, Categorie, ImageProduit, Produit
from users.factories import creer_admin, creer_client, creer_entreprise, creer_produit, png_bytes


def fichier_png(nom='photo.png'):
    return SimpleUploadedFile(nom, png_bytes(), content_type='image/png')


def commande_livree(client_user, produit):
    commande = Commande.objects.create(
        client=client_user.client, entreprise=produit.entreprise, montant_total=produit.prix,
        adresse_livraison='a', ville_livraison='v', code_postal_livraison='1',
        pays_livraison='MG', telephone_livraison='1', status='delivered')
    LigneCommande.objects.create(commande=commande, produit=produit, nom_produit=produit.nom,
                                 prix_unitaire=produit.prix, quantite=1)
    return commande


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProprieteProduitsTests(APITestCase):
    def setUp(self):
        self.ent1 = creer_entreprise('ent1')
        self.ent2 = creer_entreprise('ent2')
        self.cli = creer_client()
        self.produit = creer_produit(self.ent1, 'Chaise')
        self.url = f'/api/products/produits/{self.produit.slug}/'

    def test_client_ne_peut_pas_modifier_un_produit(self):
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.patch(self.url, {'prix': '1'}, format='json').status_code, 403)
        self.produit.refresh_from_db()
        self.assertEqual(self.produit.prix, 1000)

    def test_client_ne_peut_pas_supprimer_un_produit(self):
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.delete(self.url).status_code, 403)
        self.assertTrue(Produit.objects.filter(pk=self.produit.pk).exists())

    def test_autre_entreprise_ne_peut_pas_modifier(self):
        self.client.force_authenticate(self.ent2)
        self.assertEqual(self.client.patch(self.url, {'prix': '1'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(self.url).status_code, 403)

    def test_anonyme_ne_peut_pas_modifier(self):
        self.assertEqual(self.client.patch(self.url, {'prix': '1'}, format='json').status_code, 401)

    def test_proprietaire_modifie(self):
        self.client.force_authenticate(self.ent1)
        r = self.client.patch(self.url, {'prix': '1500'}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        self.produit.refresh_from_db()
        self.assertEqual(self.produit.prix, 1500)

    def test_admin_modifie(self):
        self.client.force_authenticate(creer_admin())
        self.assertEqual(self.client.patch(self.url, {'prix': '1200'}, format='json').status_code, 200)

    def test_images_d_autrui_protegees(self):
        image = ImageProduit.objects.create(produit=self.produit, image='produits/x.png')
        self.client.force_authenticate(self.cli)
        self.assertEqual(self.client.delete(f'/api/products/images/{image.id}/').status_code, 405)
        self.assertEqual(self.client.post(f'{self.url}ajouter_image/', {'image': fichier_png()}).status_code, 403)
        self.assertEqual(self.client.delete(f'{self.url}supprimer_image/', {'image_id': image.id}, format='json').status_code, 403)
        self.assertTrue(ImageProduit.objects.filter(pk=image.pk).exists())

    def test_proprietaire_ajoute_et_supprime_une_image(self):
        self.client.force_authenticate(self.ent1)
        r = self.client.post(f'{self.url}ajouter_image/', {'image': fichier_png()}, format='multipart')
        self.assertEqual(r.status_code, 201, r.content)
        image_id = r.json()['id']
        r = self.client.delete(f'{self.url}supprimer_image/', {'image_id': image_id}, format='json')
        self.assertEqual(r.status_code, 204)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CreationProduitTests(APITestCase):
    def setUp(self):
        self.categorie = Categorie.objects.create(nom='Cat')

    def _payload(self, **extra):
        data = {'nom': 'Table', 'description': 'd', 'prix': '10000', 'stock': '5', 'categorie': self.categorie.id}
        data.update(extra)
        return data

    def test_entreprise_non_approuvee_ne_peut_pas_publier(self):
        self.client.force_authenticate(creer_entreprise('nouvelle', approuvee=False))
        r = self.client.post('/api/products/produits/', self._payload(), format='multipart')
        self.assertEqual(r.status_code, 403)

    def test_client_ne_peut_pas_creer(self):
        self.client.force_authenticate(creer_client())
        self.assertEqual(self.client.post('/api/products/produits/', self._payload(), format='multipart').status_code, 403)

    def test_creation_avec_images(self):
        self.client.force_authenticate(creer_entreprise())
        r = self.client.post('/api/products/produits/', self._payload(image_0=fichier_png(), image_1=fichier_png('b.png')), format='multipart')
        self.assertEqual(r.status_code, 201, r.content)
        produit = Produit.objects.get(nom='Table')
        self.assertEqual(produit.images.count(), 2)
        self.assertTrue(produit.images.first().est_principale)
        self.assertEqual(r.json()['image_principale_id'], produit.images.get(est_principale=True).id)

    def test_fichier_non_image_refuse(self):
        self.client.force_authenticate(creer_entreprise())
        faux = SimpleUploadedFile('page.html', b'<script>alert(1)</script>', content_type='text/html')
        r = self.client.post('/api/products/produits/', self._payload(image_0=faux), format='multipart')
        self.assertEqual(r.status_code, 400)
        self.assertFalse(Produit.objects.filter(nom='Table').exists())

    def test_html_deguise_en_png_refuse(self):
        self.client.force_authenticate(creer_entreprise())
        faux = SimpleUploadedFile('photo.png', b'<html><script>alert(1)</script></html>', content_type='image/png')
        r = self.client.post('/api/products/produits/', self._payload(image_0=faux), format='multipart')
        self.assertEqual(r.status_code, 400)

    def test_deux_produits_meme_nom_ont_des_slugs_differents(self):
        self.client.force_authenticate(creer_entreprise())
        for _ in range(3):
            r = self.client.post('/api/products/produits/', self._payload(), format='multipart')
            self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(sorted(Produit.objects.values_list('slug', flat=True)), ['table', 'table-2', 'table-3'])

    def test_prix_promo_doit_etre_inferieur(self):
        self.client.force_authenticate(creer_entreprise())
        r = self.client.post('/api/products/produits/', self._payload(prix_promo='20000'), format='multipart')
        self.assertEqual(r.status_code, 400)
        self.assertIn('prix_promo', r.json())

    def test_prix_promo_active_la_promotion(self):
        self.client.force_authenticate(creer_entreprise())
        r = self.client.post('/api/products/produits/', self._payload(prix_promo='8000'), format='multipart')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertTrue(Produit.objects.get(nom='Table').en_promotion)

    def test_mise_a_jour_partielle_valide_la_promo_avec_le_prix_existant(self):
        ent = creer_entreprise()
        produit = creer_produit(ent, 'Lit', prix=1000)
        self.client.force_authenticate(ent)
        r = self.client.patch(f'/api/products/produits/{produit.slug}/', {'prix_promo': '5000'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_categories_meme_slug(self):
        a = Categorie.objects.create(nom='Maison Jardin')
        b = Categorie.objects.create(nom='Maison-Jardin')
        self.assertNotEqual(a.slug, b.slug)


class VisibiliteProduitsTests(APITestCase):
    def setUp(self):
        self.ent = creer_entreprise('vendeur')
        self.actif = creer_produit(self.ent, 'Actif')
        self.brouillon = creer_produit(self.ent, 'Brouillon', status='draft')
        self.inactif = creer_produit(self.ent, 'Inactif', actif=False)

    def noms(self, r):
        return sorted(p['nom'] for p in r.json()['results'])

    def test_public_ne_voit_que_les_actifs(self):
        self.assertEqual(self.noms(self.client.get('/api/products/produits/')), ['Actif'])
        self.assertEqual(self.client.get(f'/api/products/produits/{self.brouillon.slug}/').status_code, 404)

    def test_proprietaire_voit_tous_ses_produits(self):
        self.client.force_authenticate(self.ent)
        r = self.client.get('/api/products/produits/?mes_produits=true')
        self.assertEqual(self.noms(r), ['Actif', 'Brouillon', 'Inactif'])
        self.assertEqual(self.client.get(f'/api/products/produits/{self.brouillon.slug}/').status_code, 200)

    def test_autre_entreprise_ne_voit_pas_le_brouillon(self):
        self.client.force_authenticate(creer_entreprise('autre'))
        self.assertEqual(self.client.get(f'/api/products/produits/{self.brouillon.slug}/').status_code, 404)

    def test_admin_voit_tout_avec_include_inactive(self):
        self.client.force_authenticate(creer_admin())
        self.assertEqual(self.noms(self.client.get('/api/products/produits/?include_inactive=true')), ['Actif', 'Brouillon', 'Inactif'])
        self.assertEqual(self.noms(self.client.get('/api/products/produits/')), ['Actif'])

    def test_vues_non_comptees_pour_le_proprietaire(self):
        self.client.force_authenticate(self.ent)
        self.client.get(f'/api/products/produits/{self.actif.slug}/')
        self.actif.refresh_from_db()
        self.assertEqual(self.actif.nombre_vues, 0)
        self.client.force_authenticate(None)
        self.client.get(f'/api/products/produits/{self.actif.slug}/')
        self.actif.refresh_from_db()
        self.assertEqual(self.actif.nombre_vues, 1)

    def test_categorie_ne_liste_pas_les_brouillons(self):
        r = self.client.get(f'/api/products/categories/{self.actif.categorie.slug}/produits/')
        self.assertEqual([p['nom'] for p in r.json()['produits']], ['Actif'])


class SuppressionProduitTests(APITestCase):
    def test_produit_deja_commande_est_desactive_pas_supprime(self):
        ent, cli = creer_entreprise(), creer_client()
        produit = creer_produit(ent)
        commande_livree(cli, produit)
        self.client.force_authenticate(ent)
        r = self.client.delete(f'/api/products/produits/{produit.slug}/')
        self.assertEqual(r.status_code, 204)
        produit.refresh_from_db()
        self.assertFalse(produit.actif)
        self.assertEqual(produit.status, 'inactive')

    def test_produit_jamais_commande_est_supprime(self):
        ent = creer_entreprise()
        produit = creer_produit(ent)
        self.client.force_authenticate(ent)
        self.assertEqual(self.client.delete(f'/api/products/produits/{produit.slug}/').status_code, 204)
        self.assertFalse(Produit.objects.filter(pk=produit.pk).exists())


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ImagesBinairesTests(APITestCase):
    def setUp(self):
        self.ent = creer_entreprise()
        self.produit = creer_produit(self.ent)

    def _image(self, nom):
        image = ImageProduit(produit=self.produit)
        image.image.save(nom, SimpleUploadedFile(nom, png_bytes()))
        return image

    def test_blob_public_sans_token(self):
        image = self._image('a.png')
        r = self.client.get(f'/api/products/images/{image.id}/blob/', HTTP_AUTHORIZATION='Bearer jeton.invalide')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Content-Type'], 'image/png')
        self.assertTrue(b''.join(r.streaming_content).startswith(b'\x89PNG'))
        self.assertEqual(r['X-Content-Type-Options'], 'nosniff')

    def test_extension_dangereuse_jamais_servie_comme_page(self):
        image = self._image('piege.html')
        r = self.client.get(f'/api/products/images/{image.id}/blob/')
        self.assertEqual(r['Content-Type'], 'application/octet-stream')
        self.assertEqual(r['Content-Disposition'], 'attachment')

    def test_image_inexistante(self):
        self.assertEqual(self.client.get('/api/products/images/999999/blob/').status_code, 404)

    def test_json_sans_url_d_image(self):
        self._image('a.png')
        r = self.client.get(f'/api/products/produits/{self.produit.slug}/')
        image = r.json()['images'][0]
        self.assertNotIn('image', image)
        self.assertEqual(r.json()['image_principale_id'], image['id'])


class AvisTests(APITestCase):
    def setUp(self):
        self.ent = creer_entreprise()
        self.cli = creer_client()
        self.autre = creer_client('autre')
        self.produit = creer_produit(self.ent)
        commande_livree(self.cli, self.produit)
        self.donnees = {'produit': self.produit.id, 'note': 4, 'titre': 'Bien', 'commentaire': 'Très bon produit vraiment'}

    def test_client_ayant_achete_peut_noter(self):
        self.client.force_authenticate(self.cli)
        r = self.client.post('/api/products/avis/', self.donnees, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()['client'], self.cli.client.id)
        self.produit.refresh_from_db()
        self.assertEqual(float(self.produit.note_moyenne), 4.0)
        self.ent.entreprise.refresh_from_db()
        self.assertEqual(float(self.ent.entreprise.note_moyenne), 4.0)

    def test_note_deja_donnee_ou_sans_achat_refusee(self):
        self.client.force_authenticate(self.autre)
        self.assertEqual(self.client.post('/api/products/avis/', self.donnees, format='json').status_code, 400)

    def test_entreprise_ne_peut_pas_noter(self):
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.post('/api/products/avis/', self.donnees, format='json').status_code, 403)

    def test_nouvel_avis_notifie_l_entreprise(self):
        from notifications.models import Notification
        self.client.force_authenticate(self.cli)
        self.client.post('/api/products/avis/', self.donnees, format='json')
        self.assertTrue(Notification.objects.filter(destinataire=self.ent, type_notification='review').exists())

    def _creer_avis(self):
        return Avis.objects.create(produit=self.produit, client=self.cli.client, note=5, commentaire='Excellent produit livré vite')

    def test_seul_l_auteur_modifie_son_avis(self):
        avis = self._creer_avis()
        self.client.force_authenticate(self.autre)
        self.assertEqual(self.client.patch(f'/api/products/avis/{avis.id}/', {'note': 1}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/products/avis/{avis.id}/').status_code, 403)
        self.client.force_authenticate(self.cli)
        r = self.client.patch(f'/api/products/avis/{avis.id}/', {'note': 3}, format='json')
        self.assertEqual(r.status_code, 200, r.content)
        avis.refresh_from_db()
        self.assertEqual(avis.note, 3)
        self.produit.refresh_from_db()
        self.assertEqual(float(self.produit.note_moyenne), 3.0)

    def test_l_auteur_ne_peut_pas_s_auto_approuver_ni_changer_de_produit(self):
        avis = self._creer_avis()
        Avis.objects.filter(pk=avis.pk).update(approuve=False)
        autre_produit = creer_produit(self.ent, 'Autre')
        self.client.force_authenticate(self.cli)
        self.client.patch(f'/api/products/avis/{avis.id}/', {'approuve': True, 'produit': autre_produit.id, 'note': 2}, format='json')
        avis.refresh_from_db()
        self.assertFalse(avis.approuve)
        self.assertEqual(avis.produit_id, self.produit.id)

    def test_entreprise_du_produit_et_admin_moderent(self):
        avis = self._creer_avis()
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.patch(f'/api/products/avis/{avis.id}/', {'approuve': False}, format='json').status_code, 200)
        avis.refresh_from_db()
        self.assertFalse(avis.approuve)
        self.produit.refresh_from_db()
        self.assertEqual(float(self.produit.note_moyenne), 0.0)  # un avis rejeté ne compte plus

        self.client.force_authenticate(creer_entreprise('intrus'))
        self.assertEqual(self.client.patch(f'/api/products/avis/{avis.id}/', {'approuve': True}, format='json').status_code, 404)

        self.client.force_authenticate(creer_admin())
        self.assertEqual(self.client.patch(f'/api/products/avis/{avis.id}/', {'approuve': True}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/products/avis/{avis.id}/').status_code, 204)

    def test_avis_rejete_invisible_du_public_et_de_la_fiche_produit(self):
        avis = self._creer_avis()
        Avis.objects.filter(pk=avis.pk).update(approuve=False)
        self.assertEqual(len(self.client.get('/api/products/avis/').json()['results']), 0)
        self.assertEqual(self.client.get(f'/api/products/produits/{self.produit.slug}/').json()['avis'], [])

    def test_mes_avis(self):
        self._creer_avis()
        self.client.force_authenticate(self.cli)
        r = self.client.get('/api/products/avis/mes_avis/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
        self.client.force_authenticate(self.ent)
        self.assertEqual(self.client.get('/api/products/avis/mes_avis/').status_code, 403)

    def test_suppression_recalcule_la_note(self):
        avis = self._creer_avis()
        self.produit.refresh_from_db()
        self.assertEqual(float(self.produit.note_moyenne), 5.0)
        avis.delete()
        self.produit.refresh_from_db()
        self.assertEqual(float(self.produit.note_moyenne), 0.0)

    def test_entreprise_liste_les_avis_de_ses_produits(self):
        avis = self._creer_avis()
        Avis.objects.filter(pk=avis.pk).update(approuve=False)
        self.client.force_authenticate(self.ent)
        r = self.client.get('/api/products/avis/?mes_produits=true')
        self.assertEqual(len(r.json()['results']), 1)

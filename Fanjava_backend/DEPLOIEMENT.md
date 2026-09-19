# Configuration et déploiement du backend

## Secrets : variables d'environnement (jamais dans git)

`settings.py` lit sa configuration dans les variables d'environnement, ou dans un fichier
`Fanjava_backend/.env` (ignoré par git). Copiez `.env.example` en `.env` et renseignez :

| Variable | Rôle |
|---|---|
| `DJANGO_SECRET_KEY` | **Obligatoire.** Signe les sessions ET les jetons JWT. Générer une clé aléatoire unique. |
| `DJANGO_DEBUG` | `True` uniquement en développement local. |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Connexion MySQL. |
| `FRONTEND_URL` | URL publique du site (liens des e-mails). Local : `http://localhost:5173`. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `DEFAULT_FROM_EMAIL` | Envoi d'e-mails (mot de passe oublié, confirmation d'adresse). **Sans `EMAIL_HOST`, aucun e-mail n'est réellement envoyé** : ils sont seulement écrits dans les logs. |

Sur le serveur, ces variables sont dans `/etc/fanjava.env` (lisible seulement par root et le groupe
`django`), chargé par le service systemd `fanjava-backend`.

## Commandes utiles

```bash
python manage.py migrate                  # appliquer les migrations
python manage.py recalculer_stats         # recalcule notes moyennes et ventes (idempotent)
python manage.py test --settings=Fanjava_backend.settings_test   # tests (SQLite en mémoire)
```

## Paiements

L'API `/api/payments/` gère le **suivi** des paiements : le client déclare son paiement
(espèces, virement, Mobile Money + référence), le vendeur le confirme, un admin peut rembourser.
Aucune passerelle automatique (Mvola, Orange Money, Stripe...) n'est branchée : cela demande un
contrat et des identifiants auprès du prestataire.

## Rôles

Un compte administrateur ne peut pas être créé par l'inscription publique. Le créer avec
`python manage.py createsuperuser` puis mettre `user_type = admin` depuis l'admin Django.

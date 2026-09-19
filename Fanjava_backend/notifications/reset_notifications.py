# reset_notifications.py - Script de reset automatique

import os
import django
import sys

# ATTENTION : ce script SUPPRIME toutes les notifications et peut supprimer des tables.
# Il demande une confirmation explicite avant de faire quoi que ce soit.
if input('Tapez RESET pour supprimer TOUTES les notifications : ').strip() != 'RESET':
    print('Annulé.')
    sys.exit(1)


# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Fanjava_backend.settings')
django.setup()

from notifications.models import Notification
from django.db import connection

print("🔄 RESET DES NOTIFICATIONS V2")
print("=" * 50)

# 1. Supprimer toutes les notifications existantes
print("\n1️⃣ Suppression des anciennes notifications...")
try:
    count = Notification.objects.all().count()
    Notification.objects.all().delete()
    print(f"   ✅ {count} notification(s) supprimée(s)")
except Exception as e:
    print(f"   ⚠️  Erreur (normal si table n'existe pas): {e}")

# 2. Supprimer les tables si elles existent
print("\n2️⃣ Suppression des anciennes tables...")
with connection.cursor() as cursor:
    try:
        cursor.execute("DROP TABLE IF EXISTS notifications_notificationstatus")
        print("   ✅ Table notifications_notificationstatus supprimée")
    except:
        pass
    
    try:
        cursor.execute("DROP TABLE IF EXISTS notifications_notification")
        print("   ✅ Table notifications_notification supprimée")
    except:
        pass

print("\n✅ Reset terminé !")
print("\nPROCHAINES ÉTAPES :")
print("1. Supprimer les migrations : rm notifications/migrations/0*.py")
print("2. Créer migrations : python manage.py makemigrations notifications")
print("3. Appliquer migrations : python manage.py migrate notifications")
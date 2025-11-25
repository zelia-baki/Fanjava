# notifications/admin.py
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'titre', 'type_notification', 'lue', 'created_at']
    list_filter = ['type_notification', 'lue']
    search_fields = ['titre', 'message']
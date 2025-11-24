from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class AuditModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, related_name='%(class)s_created', on_delete=models.SET_NULL, null=True)
    updated_by = models.ForeignKey(User, related_name='%(class)s_updated', on_delete=models.SET_NULL, null=True)

    class Meta:
       abstract=True
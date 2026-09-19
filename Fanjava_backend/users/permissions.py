# users/permissions.py

from rest_framework.permissions import BasePermission


def is_admin(user):
    """Définition UNIQUE d'un administrateur pour tout le projet."""
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or user.is_superuser
            or getattr(user, 'user_type', None) == 'admin'
        )
    )


class IsAdminUser(BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un admin
    """
    
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsEntrepriseOwner(BasePermission):
    """
    Permission pour vérifier que l'utilisateur est le propriétaire de l'entreprise
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'entreprise')
        )
    
    def has_object_permission(self, request, view, obj):
        # Vérifier que l'objet appartient à l'entreprise de l'utilisateur
        if hasattr(obj, 'entreprise'):
            return obj.entreprise == request.user.entreprise
        return False


class IsClientOrAdmin(BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un client ou un admin
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (
                hasattr(request.user, 'client') or
                request.user.is_staff or
                request.user.is_superuser or
                getattr(request.user, 'user_type', None) == 'admin'
            )
        )
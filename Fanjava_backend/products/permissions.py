# products/permissions.py

from rest_framework import permissions

from users.permissions import is_admin


class IsEntrepriseOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Lecture pour tous. Écriture réservée à l'entreprise propriétaire de l'objet
    (ou à un administrateur).
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user.is_authenticated:
            return False
        return is_admin(user) or hasattr(user, 'entreprise')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if is_admin(user):
            return True
        entreprise = getattr(user, 'entreprise', None)
        return entreprise is not None and obj.entreprise_id == entreprise.id


# Ancien nom conservé pour compatibilité
IsEntrepriseOwnerOrReadOnly = IsEntrepriseOwnerOrAdminOrReadOnly


class IsEntrepriseOwner(permissions.BasePermission):
    """Permission pour vérifier que l'utilisateur est une entreprise."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'entreprise')


class IsClientOwner(permissions.BasePermission):
    """Permission pour vérifier que l'utilisateur est un client."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'client')

    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'client'):
            return obj.client == request.user.client
        return False


class IsAdminUser(permissions.BasePermission):
    """
    Lecture pour tous, écriture uniquement pour les administrateurs
    (même définition d'« administrateur » que dans tout le projet).
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)

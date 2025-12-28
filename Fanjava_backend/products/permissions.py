# products/permissions.py

from rest_framework import permissions


class IsEntrepriseOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser uniquement les entreprises
    à modifier leurs propres produits.
    """

    def has_permission(self, request, view):
        # Les requêtes en lecture (GET, HEAD, OPTIONS) sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return True

        # Les requêtes d'écriture nécessitent une authentification
        if not request.user.is_authenticated:
            return False

        # Vérifier que l'utilisateur est une entreprise
        return hasattr(request.user, 'entreprise')

    def has_object_permission(self, request, view, obj):
        # Les requêtes en lecture sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return True

        # Les requêtes d'écriture nécessitent que l'utilisateur soit le propriétaire
        if hasattr(request.user, 'entreprise'):
            return obj.entreprise == request.user.entreprise

        return False


class IsEntrepriseOwner(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est une entreprise.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'entreprise')


class IsClientOwner(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un client.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'client')

    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'client'):
            return obj.client == request.user.client
        return False


class IsAdminUser(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un administrateur.
    Les admins peuvent tout faire, les autres peuvent seulement lire.
    """

    def has_permission(self, request, view):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture uniquement pour les admins
        return (
            request.user and 
            request.user.is_authenticated and
            (request.user.is_staff or 
             request.user.is_superuser or 
             getattr(request.user, 'user_type', None) == 'admin')
        )
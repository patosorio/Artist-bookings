# agencies/permissions.py

from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import View
from typing import Any


class IsAgencyMember(permissions.BasePermission):
    """
    Permission to check if user belongs to an agency and has an active profile.
    
    This permission should be used on top of IsAuthenticated for all
    agency-scoped resources like promoters, venues, contacts, etc.
    """
    
    message = "You must be an active member of an agency to perform this action."
    
    def has_permission(self, request: Request, view: View) -> bool:
        """
        Check if user has an active agency profile.
        """
        # Must be authenticated first
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has a profile
        if not hasattr(request.user, 'userprofile'):
            return False
        
        user_profile = request.user.userprofile
        
        # Check if profile is active
        if not user_profile.is_active:
            self.message = "Your agency profile is inactive."
            return False
        
        # Check if profile belongs to an agency
        if not user_profile.agency:
            self.message = "You are not associated with any agency."
            return False
        
        # Check if agency is active/set up
        if not user_profile.agency.is_set_up:
            self.message = "Your agency setup is not complete."
            return False
        
        return True
    
    def has_object_permission(self, request: Request, view: View, obj: Any) -> bool:
        """
        Check if user can access this specific object.
        The object must belong to the same agency as the user.
        """
        # First check if user has general permission
        if not self.has_permission(request, view):
            return False
        
        # Check if object belongs to same agency
        if hasattr(obj, 'agency'):
            return obj.agency == request.user.userprofile.agency
        
        # For objects without agency field, allow if has general permission
        return True


class IsAgencyOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner of the agency.
    Used for sensitive operations like deleting agency, changing critical settings.
    """
    
    message = "You must be the agency owner to perform this action."
    
    def has_permission(self, request: Request, view: View) -> bool:
        """Check if user is agency owner."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'userprofile'):
            return False
        
        user_profile = request.user.userprofile
        
        # Check if user owns the agency
        if hasattr(request.user, 'owned_agency'):
            return user_profile.agency == request.user.owned_agency
        
        # Alternative check via role
        return user_profile.role == 'agency_owner'
    
    def has_object_permission(self, request: Request, view: View, obj: Any) -> bool:
        """Check if user can modify this specific object as owner."""
        if not self.has_permission(request, view):
            return False
        
        # Check if object belongs to owned agency
        if hasattr(obj, 'agency'):
            return obj.agency == request.user.owned_agency
        
        return True


class IsAgencyManagerOrOwner(permissions.BasePermission):
    """
    Permission for users with management privileges (owners or managers).
    Used for operations like user management, sensitive data access, etc.
    """
    
    message = "You must be an agency manager or owner to perform this action."
    
    def has_permission(self, request: Request, view: View) -> bool:
        """Check if user has management privileges."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'userprofile'):
            return False
        
        user_profile = request.user.userprofile
        
        # Check if profile is active and has agency
        if not user_profile.is_active or not user_profile.agency:
            return False
        
        # Check role
        management_roles = ['agency_owner', 'agency_manager']
        return user_profile.role in management_roles
    
    def has_object_permission(self, request: Request, view: View, obj: Any) -> bool:
        """Check object-level permissions for managers."""
        if not self.has_permission(request, view):
            return False
        
        # Check if object belongs to same agency
        if hasattr(obj, 'agency'):
            return obj.agency == request.user.userprofile.agency
        
        return True


# Convenience permission combinations
class StandardAgencyPermissions:
    """Common permission combinations for agency resources."""
    
    # Most common: authenticated + agency member
    AGENCY_MEMBER = [permissions.IsAuthenticated, IsAgencyMember]
    
    # For management operations
    AGENCY_MANAGER = [permissions.IsAuthenticated, IsAgencyManagerOrOwner]
    
    # For owner-only operations
    AGENCY_OWNER = [permissions.IsAuthenticated, IsAgencyOwner]
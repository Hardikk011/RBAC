from django.db import models
from django.contrib.auth.models import AbstractUser


class Permission(models.Model):
    """
    Represents a single permission like 'delete_user' or 'edit_role'.
    These get assigned to Roles, not directly to users.
    """
    codename = models.CharField(max_length=100, unique=True, help_text="e.g. delete_user, view_reports")
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['codename']

    def __str__(self):
        return self.codename


class Role(models.Model):
    """
    A role groups multiple permissions together.
    For example, 'Admin' might have all permissions while 'Viewer' has read-only ones.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    permissions = models.ManyToManyField(Permission, related_name='roles', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    """
    Extended user model that supports multiple roles.
    Each role carries its own set of permissions, so a user's
    effective permissions = union of all permissions from all assigned roles.
    """
    roles = models.ManyToManyField(Role, related_name='users', blank=True)

    def get_all_permissions_list(self):
        """Collect every permission codename from all assigned roles."""
        perms = set()
        for role in self.roles.prefetch_related('permissions').all():
            for perm in role.permissions.all():
                perms.add(perm.codename)
        return list(perms)

    def has_rbac_permission(self, codename):
        """Check if the user has a specific permission through any of their roles."""
        return self.roles.filter(permissions__codename=codename).exists()

    def __str__(self):
        return self.username

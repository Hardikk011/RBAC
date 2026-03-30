from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Permission, Role, CustomUser


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'codename', 'description', 'created_at')
    search_fields = ('codename',)
    ordering = ('codename',)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'created_at')
    search_fields = ('name',)
    filter_horizontal = ('permissions',)
    ordering = ('name',)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'is_active', 'date_joined')
    search_fields = ('username', 'email')
    filter_horizontal = ('roles', 'groups', 'user_permissions')
    fieldsets = UserAdmin.fieldsets + (
        ('RBAC Roles', {'fields': ('roles',)}),
    )

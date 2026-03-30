from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PermissionViewSet,
    RoleViewSet,
    UserViewSet,
    RegisterView,
    CheckPermissionView,
)

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet, basename='permissions')
router.register(r'roles', RoleViewSet, basename='roles')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('check-permission/', CheckPermissionView.as_view(), name='check-permission'),
]

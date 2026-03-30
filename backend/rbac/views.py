from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Permission, Role, CustomUser
from .serializers import (
    PermissionSerializer,
    RoleSerializer,
    UserSerializer,
    UserCreateSerializer,
)


# ─── Permission CRUD ────────────────────────────────────────────

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]


# ─── Role CRUD ───────────────────────────────────────────────────

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


# ─── User CRUD + assign roles ───────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.prefetch_related('roles__permissions').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='assign_roles')
    def assign_roles(self, request, pk=None):
        """
        POST /api/users/<id>/assign_roles/
        Body: {"role_ids": [1, 2, 3]}
        Replaces the user's current roles with the provided ones.
        """
        user = get_object_or_404(CustomUser, pk=pk)
        role_ids = request.data.get('role_ids', [])

        if not isinstance(role_ids, list):
            return Response(
                {'error': 'role_ids must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # validate that all role IDs actually exist
        roles = Role.objects.filter(id__in=role_ids)
        if roles.count() != len(role_ids):
            return Response(
                {'error': 'One or more role IDs are invalid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.roles.set(roles)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─── Registration (public) ──────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Permission checker ─────────────────────────────────────────

class CheckPermissionView(APIView):
    """
    GET /api/check-permission/?user_id=1&permission=delete_user
    Returns whether the given user has the specified permission
    through any of their assigned roles.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        permission_codename = request.query_params.get('permission')

        if not user_id or not permission_codename:
            return Response(
                {'error': 'Both user_id and permission query params are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(CustomUser, pk=user_id)
        has_perm = user.has_rbac_permission(permission_codename)

        return Response({
            'user': user.username,
            'permission': permission_codename,
            'has_permission': has_perm,
        })

from django.core.management.base import BaseCommand
from rbac.models import Permission, Role, CustomUser
from django.db import transaction

class Command(BaseCommand):
    help = 'Creates a comprehensive set of sample permissions, roles, and users for thorough testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding comprehensive database data...\n')

        with transaction.atomic():
            # --- 1. Permissions ---
            # Grouping permissions for better organization
            permission_list = [
                # Dashboard
                {'codename': 'view_dashboard', 'description': 'Access to view the system dashboard and statistics'},
                
                # User Management
                {'codename': 'view_users', 'description': 'Can view list of users'},
                {'codename': 'create_user', 'description': 'Can create new user accounts'},
                {'codename': 'edit_user', 'description': 'Can modify existing user profiles'},
                {'codename': 'delete_user', 'description': 'Can permanently delete user accounts'},
                {'codename': 'assign_roles', 'description': 'Can manage role assignments for users'},
                
                # Role Management
                {'codename': 'view_roles', 'description': 'Can view list of system roles'},
                {'codename': 'create_role', 'description': 'Can create new access roles'},
                {'codename': 'edit_role', 'description': 'Can modify existing role permissions'},
                {'codename': 'delete_role', 'description': 'Can delete system roles'},
                
                # Permission Management
                {'codename': 'view_permissions', 'description': 'Can view all granular system permissions'},
                {'codename': 'create_permission', 'description': 'Can define new system permissions'},
            ]

            perms = {}
            for p_info in permission_list:
                perm, created = Permission.objects.update_or_create(
                    codename=p_info['codename'],
                    defaults={'description': p_info['description']}
                )
                perms[p_info['codename']] = perm
                status = "created" if created else "updated"
                self.stdout.write(f'  [Perm] {perm.codename:20} -> {status}')

            # --- 2. Roles ---
            role_definitions = [
                {
                    'name': 'Administrator',
                    'description': 'Full system access. Can manage all aspects of users, roles, and permissions.',
                    'perms': list(perms.values())  # All permissions
                },
                {
                    'name': 'Manager',
                    'description': 'Can manage users and view reports, but cannot modify system roles or permissions.',
                    'perms': [
                        perms['view_dashboard'], perms['view_users'], perms['create_user'], 
                        perms['edit_user'], perms['assign_roles'], perms['view_roles']
                    ]
                },
                {
                    'name': 'Editor',
                    'description': 'Can view and edit users, but cannot create or delete accounts.',
                    'perms': [
                        perms['view_dashboard'], perms['view_users'], perms['edit_user']
                    ]
                },
                {
                    'name': 'Auditor',
                    'description': 'Read-only access to everything for compliance monitoring.',
                    'perms': [
                        perms['view_dashboard'], perms['view_users'], perms['view_roles'], perms['view_permissions']
                    ]
                },
                {
                    'name': 'Standard User',
                    'description': 'Basic access to the dashboard only.',
                    'perms': [perms['view_dashboard']]
                }
            ]

            roles = {}
            for r_info in role_definitions:
                role, created = Role.objects.update_or_create(
                    name=r_info['name'],
                    defaults={'description': r_info['description']}
                )
                role.permissions.set(r_info['perms'])
                roles[r_info['name']] = role
                status = "created" if created else "updated"
                self.stdout.write(f'  [Role] {role.name:20} -> {status}')

            # --- 3. Users ---
            users_to_create = [
                {
                    'username': 'admin',
                    'email': 'admin@system.local',
                    'password': 'admin1234',
                    'is_superuser': True,
                    'roles': [roles['Administrator']]
                },
                {
                    'username': 'hardik',
                    'email': 'hardik@test.com',
                    'password': 'hardik1234',
                    'is_superuser': False,
                    'roles': [roles['Manager']]
                },
                {
                    'username': 'kunj',
                    'email': 'kunj@test.com',
                    'password': 'kunj1234',
                    'is_superuser': False,
                    'roles': [roles['Editor'], roles['Auditor']] # Multiple roles test
                },
                {
                    'username': 'guest_user',
                    'email': 'guest@test.com',
                    'password': 'guest1234',
                    'is_superuser': False,
                    'roles': [roles['Standard User']]
                },
                {
                    'username': 'restricted',
                    'email': 'restricted@test.com',
                    'password': 'restricted1234',
                    'is_superuser': False,
                    'roles': [] # No roles test
                }
            ]

            for u_info in users_to_create:
                if CustomUser.objects.filter(username=u_info['username']).exists():
                    user = CustomUser.objects.get(username=u_info['username'])
                    user.email = u_info['email']
                    user.set_password(u_info['password'])
                    user.is_superuser = u_info['is_superuser']
                    user.is_staff = u_info['is_superuser']
                    user.save()
                    status = "updated"
                else:
                    if u_info['is_superuser']:
                        user = CustomUser.objects.create_superuser(
                            username=u_info['username'],
                            email=u_info['email'],
                            password=u_info['password']
                        )
                    else:
                        user = CustomUser.objects.create_user(
                            username=u_info['username'],
                            email=u_info['email'],
                            password=u_info['password']
                        )
                    status = "created"
                
                user.roles.set(u_info['roles'])
                self.stdout.write(f'  [User] {user.username:20} -> {status} (Roles: {", ".join([r.name for r in u_info["roles"]]) or "None"})')

        self.stdout.write(self.style.SUCCESS('\nSuccess! Comprehensive test data is ready.'))
        self.stdout.write(f'Total: {Permission.objects.count()} Permissions, {Role.objects.count()} Roles, {CustomUser.objects.count()} Users.')

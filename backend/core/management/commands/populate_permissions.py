"""
Management command to populate system permissions.
"""
from django.core.management.base import BaseCommand
from core.models import Permission
from core.permissions import SYSTEM_PERMISSIONS


class Command(BaseCommand):
    help = 'Populate system permissions in the database'

    def handle(self, *args, **options):
        self.stdout.write('Populating system permissions...')
        
        created_count = 0
        updated_count = 0
        
        for code, data in SYSTEM_PERMISSIONS.items():
            permission, created = Permission.objects.update_or_create(
                code=code,
                defaults={
                    'name': data['name'],
                    'module': data['module'],
                    'is_system': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Created: {permission.code}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'  → Updated: {permission.code}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {created_count} permissions, updated {updated_count} permissions.'
            )
        )
        
        # Show summary by module
        self.stdout.write('\nPermissions by module:')
        from django.db.models import Count
        modules = Permission.objects.values('module').annotate(
            count=Count('id')
        ).order_by('module')
        
        for module in modules:
            self.stdout.write(f"  • {module['module']}: {module['count']} permissions")

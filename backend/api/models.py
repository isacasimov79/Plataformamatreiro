"""
API Models

Note: Os models já estão definidos no schema.sql do PostgreSQL.
O Django irá gerar os models automaticamente com `inspectdb` ou
você pode criá-los manualmente aqui.

Para gerar models automaticamente a partir do banco:
python manage.py inspectdb > api/models_generated.py
"""

from django.db import models

# Os models serão adicionados aqui conforme necessário
# Exemplo de estrutura:

# class Tenant(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4)
#     name = models.CharField(max_length=255)
#     slug = models.SlugField(max_length=100, unique=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
#     class Meta:
#         db_table = 'tenants'
#         verbose_name = 'Tenant'
#         verbose_name_plural = 'Tenants'
#
#     def __str__(self):
#         return self.name

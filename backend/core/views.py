"""
Views for Core app.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from .models import User, AuditLog
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    ImpersonateSerializer, AuditLogSerializer
)
from .utils import get_client_ip


class AuthViewSet(viewsets.GenericViewSet):
    """ViewSet for authentication."""
    
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login endpoint."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        # Update last login IP
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=['last_login_ip'])
        
        # Create audit log
        AuditLog.objects.create(
            user=user,
            action='login',
            resource_type='auth',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    @action(detail=False, methods=['post'])
    def microsoft_login(self, request):
        """Exchange Microsoft Access/ID Token for local JWT."""
        import jwt
        from jwt import PyJWKClient
        
        access_token = request.data.get('accessToken')
        id_token = request.data.get('idToken')
        account = request.data.get('account', {})
        
        if not id_token:
            return Response({'error': 'No ID Token provided'}, status=400)
            
        # Optional: Validate Signature explicitly via Azure JWKS URL
        try:
            jwks_client = PyJWKClient('https://login.microsoftonline.com/common/discovery/v2.0/keys')
            signing_key = jwks_client.get_signing_key_from_jwt(id_token)
            
            # Decode payload, turn off audience validation unless strictly matched to SPA Client ID
            data = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
        except Exception as e:
            return Response({'error': f'Invalid Token Signature: {str(e)}'}, status=400)
            
        email = data.get('email') or data.get('preferred_username') or account.get('username')
        name = data.get('name') or account.get('name') or email
        
        if not email:
            return Response({'error': 'Email claim not found in Microsoft Token'}, status=400)
            
        # Get or Create User according to policies
        user, created = User.objects.get_or_create(email=email, defaults={'username': email, 'first_name': name})
        
        # Apply strict permissions for newly auto-provisioned SSO users (unless already existent)
        if created:
            user.is_active = False # Requires Admin Approval
            user.role = 'viewer'
            user.save()
            
            AuditLog.objects.create(
                user=user, action='create', resource_type='auth',
                details={'event': 'Azure SSO Provisioning Required Admin Approval'},
                ip_address=get_client_ip(request)
            )
            return Response({'error': 'Account created but requires administrator approval.', 'success': False}, status=403)
            
        if not user.is_active:
            return Response({'error': 'Account disabled or pending approval.', 'success': False}, status=403)
            
        # Create explicit session
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=['last_login_ip'])
        
        refresh = RefreshToken.for_user(user)
        
        AuditLog.objects.create(
            user=user, action='login', resource_type='auth_sso',
            details={'provider': 'Microsoft Entra'},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
        
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout endpoint."""
        # Create audit log
        AuditLog.objects.create(
            user=request.user,
            action='logout',
            resource_type='auth',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': 'Logout successful'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user info."""
        return Response(UserSerializer(request.user).data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def impersonate(self, request):
        """Impersonate another user (superadmin only)."""
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Only superadmins can impersonate users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ImpersonateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        target_user_id = serializer.validated_data['target_user_id']
        
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Target user not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Set impersonation
        target_user.original_user = request.user
        target_user.is_impersonating = True
        target_user.save()
        
        # Create audit log
        AuditLog.objects.create(
            user=request.user,
            action='impersonate_start',
            resource_type='user',
            resource_id=str(target_user.id),
            details={'target_email': target_user.email},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Generate new token for target user
        refresh = RefreshToken.for_user(target_user)
        
        return Response({
            'user': UserSerializer(target_user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def stop_impersonation(self, request):
        """Stop impersonating and return to original user."""
        if not request.user.is_impersonating:
            return Response(
                {'error': 'Not currently impersonating.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        original_user = request.user.original_user
        
        # Create audit log
        AuditLog.objects.create(
            user=original_user,
            action='impersonate_end',
            resource_type='user',
            resource_id=str(request.user.id),
            details={'impersonated_email': request.user.email},
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Clear impersonation
        request.user.original_user = None
        request.user.is_impersonating = False
        request.user.save()
        
        # Generate new token for original user
        refresh = RefreshToken.for_user(original_user)
        
        return Response({
            'user': UserSerializer(original_user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filter users based on role and tenant."""
        user = self.request.user
        
        if user.role == 'superadmin':
            return User.objects.all()
        elif user.role in ['tenant_admin', 'sub_tenant_admin']:
            return User.objects.filter(tenant=user.tenant)
        else:
            return User.objects.filter(id=user.id)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Audit Logs."""
    
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter audit logs based on user role."""
        user = self.request.user
        
        if user.role == 'superadmin':
            return AuditLog.objects.all()
        elif user.role in ['tenant_admin', 'sub_tenant_admin']:
            return AuditLog.objects.filter(user__tenant=user.tenant)
        else:
            return AuditLog.objects.filter(user=user)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({'status': 'healthy', 'service': 'matreiro-api'})

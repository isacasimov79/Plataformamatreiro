"""
Tracking endpoints for phishing campaigns.
These handle click and open tracking for emails sent in campaigns.
"""
import base64
import json
from django.db.models import F
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone


def encode_tracking_token(campaign_id, target_email):
    """Encode campaign and target info into a base64 token."""
    data = json.dumps({
        'c': campaign_id,
        'e': target_email,
        't': timezone.now().isoformat()
    })
    return base64.urlsafe_b64encode(data.encode()).decode()


def decode_tracking_token(token):
    """Decode a tracking token. Returns (campaign_id, target_email) or (None, None)."""
    try:
        data = base64.urlsafe_b64decode(token.encode()).decode()
        obj = json.loads(data)
        return obj.get('c'), obj.get('e')
    except Exception:
        return None, None


@api_view(['GET'])
@permission_classes([AllowAny])
def track_open(request, token):
    """
    Track email open (via tracking pixel).
    Returns a 1x1 transparent GIF image.
    """
    campaign_id, target_email = decode_tracking_token(token)
    
    if campaign_id and target_email:
        try:
            from campaigns.models import CampaignEvent, Campaign
            # Try to find campaign and record event
            try:
                campaign = Campaign.objects.get(id=campaign_id)
                CampaignEvent.objects.create(
                    campaign=campaign,
                    event_type='opened',
                    target_email=target_email,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                # Increment campaign emails_opened
                Campaign.objects.filter(id=campaign_id).update(
                    emails_opened=F('emails_opened') + 1
                )
            except Campaign.DoesNotExist:
                pass
        except Exception:
            pass  # Silently fail - tracking should not break emails
    
    # Return 1x1 transparent GIF
    gif_data = base64.b64decode(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    )
    return HttpResponse(gif_data, content_type='image/gif')


@api_view(['GET'])
@permission_classes([AllowAny])
def track_click(request, token):
    """
    Track email link click.
    Records the click event and redirects to the landing page.
    """
    campaign_id, target_email = decode_tracking_token(token)
    landing_url = '/'
    
    if campaign_id and target_email:
        try:
            from campaigns.models import CampaignEvent, Campaign, LandingPage
            try:
                campaign = Campaign.objects.get(id=campaign_id)
                
                # Record the click event
                CampaignEvent.objects.create(
                    campaign=campaign,
                    event_type='clicked',
                    target_email=target_email,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                # Increment campaign links_clicked
                Campaign.objects.filter(id=campaign_id).update(
                    links_clicked=F('links_clicked') + 1
                )
                
                # Try to get landing page URL for redirect
                try:
                    landing = LandingPage.objects.get(template=campaign.template)
                    landing_url = f'/landing/{landing.id}/'
                except LandingPage.DoesNotExist:
                    landing_url = '/?track=clicked'
                    
            except Campaign.DoesNotExist:
                landing_url = '/?track=invalid'
        except Exception as e:
            landing_url = '/?track=error'
    else:
        landing_url = '/?track=invalid'
    
    # Redirect to landing page
    return HttpResponseRedirect(landing_url)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_submit(request, token):
    """
    Track credential/data submission from landing page.
    """
    campaign_id, target_email = decode_tracking_token(token)
    
    if campaign_id and target_email:
        try:
            from campaigns.models import CampaignEvent, Campaign
            try:
                campaign = Campaign.objects.get(id=campaign_id)
                
                # Record submission event
                CampaignEvent.objects.create(
                    campaign=campaign,
                    event_type='submitted',
                    target_email=target_email,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details={'method': 'POST'}
                )
                
                # Increment credentials submitted counter
                Campaign.objects.filter(id=campaign_id).update(
                    credentials_submitted=F('credentials_submitted') + 1
                )
                
                return Response({'status': 'ok', 'redirect': '/?success=1'})
            except Campaign.DoesNotExist:
                pass
        except Exception:
            pass
    
    return Response({'status': 'error'}, status=400)


def get_client_ip(request):
    """Extract client IP from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', None)


# URL patterns for tracking
urlpatterns = [
    path('open/<str:token>/', track_open, name='track-open'),
    path('click/<str:token>/', track_click, name='track-click'),
    path('submit/<str:token>/', track_submit, name='track-submit'),
]

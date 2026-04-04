"""
Microsoft Graph API Client for Matreiro Platform
Real integration with Microsoft Azure AD / Office 365 using MSAL and requests
"""
import logging
from typing import Dict, List, Optional, Any
import re
import requests

logger = logging.getLogger(__name__)


class MicrosoftGraphClient:
    """Client for Microsoft Graph API operations using MSAL for authentication."""

    GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"

    def __init__(self, tenant_id: str, client_id: str, client_secret: str):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self._access_token = None

    def _get_access_token(self) -> Optional[str]:
        """Get access token using MSAL client credentials flow."""
        if self._access_token:
            return self._access_token

        try:
            from msal import ConfidentialClientApplication

            app = ConfidentialClientApplication(
                client_id=self.client_id,
                client_credential=self.client_secret,
                authority=f"https://login.microsoftonline.com/{self.tenant_id}"
            )

            result = app.acquire_token_for_client(
                scopes=["https://graph.microsoft.com/.default"]
            )

            if "access_token" in result:
                self._access_token = result["access_token"]
                return self._access_token
            else:
                error = result.get("error_description", result.get("error", "Unknown error"))
                logger.error(f"Failed to get access token: {error}")
                return None

        except Exception as e:
            logger.error(f"Error getting access token: {e}")
            return None

    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make authenticated request to Microsoft Graph API."""
        access_token = self._get_access_token()
        if not access_token:
            return None

        url = f"{self.GRAPH_BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"Graph API HTTP error: {e.response.status_code} - {e.response.text}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Graph API request error: {e}")
            return None

    def _make_post_request(self, endpoint: str, data: Dict = None) -> Optional[Dict]:
        """Make authenticated POST request to Microsoft Graph API."""
        access_token = self._get_access_token()
        if not access_token:
            return None

        url = f"{self.GRAPH_BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"Graph API HTTP error: {e.response.status_code} - {e.response.text}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Graph API request error: {e}")
            return None

    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to Microsoft Graph API.
        Returns organization info if successful.
        """
        result = self._make_request("/organization")

        if result:
            org_list = result.get('value', [])
            if org_list:
                org = org_list[0]
                return {
                    "success": True,
                    "organization": {
                        "name": org.get('displayName', 'Unknown'),
                        "tenantId": self.tenant_id,
                        "id": org.get('id', '')
                    }
                }
            return {
                "success": False,
                "error": "No organization found"
            }
        else:
            return {
                "success": False,
                "error": "Failed to connect to Microsoft Graph API",
                "details": "Check your credentials and internet connection"
            }

    def get_users(self, max_results: int = 100, allowed_domains: List[str] = None) -> Dict[str, Any]:
        """
        Get users from Azure AD / Microsoft Graph.
        """
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,userPrincipalName,displayName,mail,department,jobTitle,accountEnabled',
            '$filter': 'accountEnabled eq true'
        }

        result = self._make_request("/users", params=params)

        if result is None:
            return {
                "success": False,
                "error": "Failed to fetch users from Microsoft Graph API"
            }

        users = []
        for user in result.get('value', []):
            email = user.get('mail') or user.get('userPrincipalName', '')

            # Filter by allowed domains if specified
            if allowed_domains:
                domain = email.split('@')[1] if '@' in email else ''
                if domain and not any(domain.lower() == d.lower() for d in allowed_domains):
                    continue

            users.append({
                "id": user.get('id'),
                "email": email,
                "name": user.get('displayName', ''),
                "department": user.get('department') or '',
                "jobTitle": user.get('jobTitle') or '',
                "enabled": user.get('accountEnabled', True)
            })

        return {
            "success": True,
            "users": users,
            "count": len(users)
        }

    def get_groups(self, max_results: int = 100) -> Dict[str, Any]:
        """
        Get groups from Azure AD / Microsoft Graph.
        """
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,displayName,description,mail'
        }

        result = self._make_request("/groups", params=params)

        if result is None:
            return {
                "success": False,
                "error": "Failed to fetch groups from Microsoft Graph API"
            }

        groups = []
        for group in result.get('value', []):
            groups.append({
                "id": group.get('id'),
                "name": group.get('displayName', ''),
                "description": group.get('description') or '',
                "email": group.get('mail') or ''
            })

        return {
            "success": True,
            "groups": groups,
            "count": len(groups)
        }

    def get_group_members(self, group_id: str, max_results: int = 100) -> Dict[str, Any]:
        """
        Get members of a specific group.
        """
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,userPrincipalName,displayName,mail,department'
        }

        result = self._make_request(f"/groups/{group_id}/members", params=params)

        if result is None:
            return {
                "success": False,
                "error": "Failed to fetch group members from Microsoft Graph API"
            }

        members = []
        for member in result.get('value', []):
            # Skip non-user objects (could be other groups)
            if member.get('@odata.type', '').endswith('#microsoft.graph.user'):
                email = member.get('mail') or member.get('userPrincipalName', '')
                members.append({
                    "id": member.get('id'),
                    "email": email,
                    "name": member.get('displayName', ''),
                    "department": member.get('department') or ''
                })

        return {
            "success": True,
            "members": members,
            "count": len(members)
        }


def validate_uuid(value: str) -> bool:
    """Validate UUID format."""
    if not value:
        return False
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    return bool(re.match(pattern, str(value).lower()))


def validate_credentials(tenant_id: str, client_id: str, client_secret: str) -> tuple:
    """
    Validate Azure AD credentials format.
    Returns (is_valid, error_message)
    """
    if not tenant_id:
        return False, "Tenant ID é obrigatório"

    if not client_id:
        return False, "Client ID é obrigatório"

    if not client_secret:
        return False, "Client Secret é obrigatório"

    if not validate_uuid(tenant_id):
        return False, "Tenant ID deve ser um UUID válido (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"

    if not validate_uuid(client_id):
        return False, "Client ID deve ser um UUID válido (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"

    return True, None

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

    def _paginate(self, endpoint: str, params: Dict, max_results: int = 999) -> List[Dict]:
        """Follow @odata.nextLink to get all pages."""
        all_items = []
        result = self._make_request(endpoint, params=params)
        if result is None:
            return []
        all_items.extend(result.get('value', []))
        next_link = result.get('@odata.nextLink')
        while next_link and len(all_items) < max_results:
            try:
                access_token = self._get_access_token()
                headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
                resp = requests.get(next_link, headers=headers, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                all_items.extend(data.get('value', []))
                next_link = data.get('@odata.nextLink')
            except Exception as e:
                logger.error(f"Pagination error: {e}")
                break
        return all_items[:max_results]

    def get_users(self, max_results: int = 5000, allowed_domains: List[str] = None) -> Dict[str, Any]:
        """Get users from Azure AD with full pagination."""
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,userPrincipalName,displayName,mail,department,jobTitle,accountEnabled',
            '$filter': 'accountEnabled eq true'
        }

        raw_users = self._paginate("/users", params, max_results)
        if not raw_users:
            return {"success": False, "error": "Failed to fetch users from Microsoft Graph API"}

        users = []
        for user in raw_users:
            email = user.get('mail') or user.get('userPrincipalName', '')
            if not email or '@' not in email:
                continue
            if allowed_domains:
                domain = email.split('@')[1]
                if not any(domain.lower() == d.lower() for d in allowed_domains):
                    continue
            users.append({
                "id": user.get('id'),
                "email": email,
                "name": user.get('displayName', ''),
                "department": user.get('department') or '',
                "jobTitle": user.get('jobTitle') or '',
                "enabled": user.get('accountEnabled', True)
            })
        return {"success": True, "users": users, "count": len(users)}

    def get_groups(self, max_results: int = 500) -> Dict[str, Any]:
        """Get groups from Azure AD with pagination."""
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,displayName,description,mail'
        }
        raw_groups = self._paginate("/groups", params, max_results)
        if not raw_groups:
            return {"success": False, "error": "Failed to fetch groups from Microsoft Graph API"}
        groups = []
        for group in raw_groups:
            groups.append({
                "id": group.get('id'),
                "name": group.get('displayName', ''),
                "description": group.get('description') or '',
                "email": group.get('mail') or ''
            })
        return {"success": True, "groups": groups, "count": len(groups)}

    def get_group_members(self, group_id: str, max_results: int = 500) -> Dict[str, Any]:
        """Get members of a specific group with pagination."""
        params = {
            '$top': min(max_results, 999),
            '$select': 'id,userPrincipalName,displayName,mail,department'
        }
        raw_members = self._paginate(f"/groups/{group_id}/members", params, max_results)
        members = []
        for member in raw_members:
            if '#microsoft.graph.user' in member.get('@odata.type', ''):
                email = member.get('mail') or member.get('userPrincipalName', '')
                members.append({
                    "id": member.get('id'),
                    "email": email,
                    "name": member.get('displayName', ''),
                    "department": member.get('department') or ''
                })
        return {"success": True, "members": members, "count": len(members)}

    def send_mail(self, from_email: str, to_email: str, subject: str, body_html: str) -> Dict[str, Any]:
        """Send email via Microsoft Graph API /users/{from}/sendMail."""
        access_token = self._get_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to get access token"}

        url = f"{self.GRAPH_BASE_URL}/users/{from_email}/sendMail"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "message": {
                "subject": subject,
                "body": {"contentType": "HTML", "content": body_html},
                "toRecipients": [{"emailAddress": {"address": to_email}}],
            },
            "saveToSentItems": False,
        }
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code in (200, 202):
                return {"success": True}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}: {response.text[:500]}"}
        except Exception as e:
            logger.error(f"Graph send_mail error: {e}")
            return {"success": False, "error": str(e)}


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
        return False, "Tenant ID deve ser um UUID válido"
    if not validate_uuid(client_id):
        return False, "Client ID deve ser um UUID válido"
    return True, None


"""
Phishing Web Service — Landing Pages, Tracking, Training Portal.
Standalone Flask app that serves phishing simulation pages and tracks interactions.
Connects directly to the same PostgreSQL database as Django backend.
"""
import os
import base64
import json
import logging
from datetime import datetime
from flask import Flask, request, redirect, Response, render_template_string
import psycopg2
from psycopg2.extras import RealDictCursor
from user_agents import parse as ua_parse
from cryptography.fernet import Fernet

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://matreiro_user:matreiro_password@postgres:5432/matreiro_db')
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', '')

# 1x1 transparent GIF pixel
TRACKING_PIXEL = base64.b64decode(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
)


def get_db():
    """Get database connection."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def get_client_ip():
    return request.headers.get('X-Forwarded-For', request.headers.get('X-Real-IP', request.remote_addr))


def get_ua_info():
    ua_string = request.headers.get('User-Agent', '')
    ua = ua_parse(ua_string)
    return {
        'user_agent': ua_string,
        'browser': f"{ua.browser.family} {ua.browser.version_string}",
        'device': ua.device.family,
        'os': f"{ua.os.family} {ua.os.version_string}",
    }


def decode_token(token):
    """Decode base64 tracking token → (campaign_id, target_email)."""
    try:
        decoded = base64.urlsafe_b64decode(token + '==').decode('utf-8')
        parts = decoded.split(':')
        if len(parts) >= 2:
            return int(parts[0]), parts[1]
    except Exception as e:
        logger.error(f"Token decode error: {e}")
    return None, None


# =====================================================
# HEALTH CHECK
# =====================================================
@app.route('/health/')
def health():
    return {'status': 'healthy', 'service': 'phishing-web'}


# =====================================================
# TRACKING PIXEL — Email Open
# =====================================================
@app.route('/t/<token>')
def track_open(token):
    """Track email open via 1x1 pixel."""
    campaign_id, target_email = decode_token(token)
    if campaign_id and target_email:
        try:
            ua = get_ua_info()
            conn = get_db()
            cur = conn.cursor()
            # Record event
            cur.execute("""
                INSERT INTO campaign_events (campaign_id, event_type, target_email, ip_address, user_agent, timestamp)
                VALUES (%s, 'opened', %s, %s, %s, NOW())
            """, (campaign_id, target_email, get_client_ip(), ua['user_agent']))
            # Increment counter
            cur.execute("UPDATE campaigns SET emails_opened = emails_opened + 1 WHERE id = %s", (campaign_id,))
            conn.commit()
            cur.close()
            conn.close()
            logger.info(f"📧 Open tracked: campaign={campaign_id} target={target_email}")
        except Exception as e:
            logger.error(f"Track open error: {e}")
    return Response(TRACKING_PIXEL, mimetype='image/gif',
                    headers={'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache'})


# =====================================================
# CLICK TRACKING — Link Click
# =====================================================
@app.route('/c/<token>')
def track_click(token):
    """Track link click and redirect to landing page."""
    campaign_id, target_email = decode_token(token)
    redirect_url = request.args.get('url', '/')
    if campaign_id and target_email:
        try:
            ua = get_ua_info()
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO campaign_events (campaign_id, event_type, target_email, ip_address, user_agent, timestamp)
                VALUES (%s, 'clicked', %s, %s, %s, NOW())
            """, (campaign_id, target_email, get_client_ip(), ua['user_agent']))
            cur.execute("UPDATE campaigns SET links_clicked = links_clicked + 1 WHERE id = %s", (campaign_id,))
            conn.commit()
            # Check if campaign has a landing page
            cur.execute("""
                SELECT lp.html_content, lp.id FROM landing_pages lp
                JOIN email_templates et ON et.id = lp.template_id
                JOIN campaigns c ON c.template_id = et.id
                WHERE c.id = %s
            """, (campaign_id,))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row and row['html_content']:
                # Build landing page token
                lp_token = base64.urlsafe_b64encode(f"{campaign_id}:{target_email}".encode()).decode().rstrip('=')
                return redirect(f'/p/{lp_token}')
            logger.info(f"🔗 Click tracked: campaign={campaign_id} target={target_email}")
        except Exception as e:
            logger.error(f"Track click error: {e}")
    return redirect(redirect_url)


# =====================================================
# LANDING PAGE — Render phishing page
# =====================================================
@app.route('/p/<token>', methods=['GET', 'POST'])
def landing_page(token):
    """Render landing page or capture submitted data."""
    campaign_id, target_email = decode_token(token)
    if not campaign_id:
        return "Page not found", 404

    try:
        conn = get_db()
        cur = conn.cursor()
        # Get landing page HTML
        cur.execute("""
            SELECT lp.html_content, lp.capture_enabled, lp.capture_fields,
                   lp.success_message, lp.success_redirect_url, lp.id as lp_id
            FROM landing_pages lp
            JOIN email_templates et ON et.id = lp.template_id
            JOIN campaigns c ON c.template_id = et.id
            WHERE c.id = %s
        """, (campaign_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return "Page not found", 404

        if request.method == 'GET':
            # Increment view count
            cur.execute("UPDATE landing_pages SET views_count = views_count + 1 WHERE id = %s", (row['lp_id'],))
            conn.commit()
            cur.close()
            conn.close()
            # Inject form action into HTML
            html = row['html_content']
            if '<form' in html.lower() and 'action=' not in html.lower():
                html = html.replace('<form', f'<form action="/p/{token}" method="POST"', 1)
            return html

        elif request.method == 'POST':
            # Capture submitted data
            ua = get_ua_info()
            form_data = dict(request.form)
            # Encrypt captured data
            if ENCRYPTION_KEY:
                f = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)
                encrypted = f.encrypt(json.dumps(form_data).encode())
            else:
                encrypted = json.dumps(form_data).encode()

            cur.execute("""
                INSERT INTO captured_data
                (campaign_id, target_email, captured_data_encrypted, fields_captured,
                 ip_address, user_agent, browser, device, os, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                campaign_id, target_email, encrypted, json.dumps(list(form_data.keys())),
                get_client_ip(), ua['user_agent'], ua['browser'], ua['device'], ua['os']
            ))
            # Record event
            cur.execute("""
                INSERT INTO campaign_events (campaign_id, event_type, target_email, ip_address, user_agent, timestamp)
                VALUES (%s, 'submitted', %s, %s, %s, NOW())
            """, (campaign_id, target_email, get_client_ip(), ua['user_agent']))
            cur.execute("UPDATE campaigns SET credentials_submitted = credentials_submitted + 1 WHERE id = %s", (campaign_id,))
            cur.execute("UPDATE landing_pages SET submissions_count = submissions_count + 1 WHERE id = %s", (row['lp_id'],))
            conn.commit()
            cur.close()
            conn.close()
            logger.info(f"🎣 Data captured: campaign={campaign_id} target={target_email} fields={list(form_data.keys())}")
            if row.get('success_redirect_url'):
                return redirect(row['success_redirect_url'])
            return render_template_string(AWARENESS_PAGE, message=row.get('success_message', ''))
    except Exception as e:
        logger.error(f"Landing page error: {e}")
        return "An error occurred", 500


# =====================================================
# ATTACHMENT DOWNLOAD
# =====================================================
@app.route('/d/<token>')
def download_attachment(token):
    """Track attachment download (malware simulation)."""
    campaign_id, target_email = decode_token(token)
    attachment_id = request.args.get('aid')
    if campaign_id and target_email:
        try:
            ua = get_ua_info()
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO campaign_events (campaign_id, event_type, target_email, ip_address, user_agent, timestamp)
                VALUES (%s, 'download', %s, %s, %s, NOW())
            """, (campaign_id, target_email, get_client_ip(), ua['user_agent']))
            if attachment_id:
                cur.execute("UPDATE landing_page_attachments SET download_count = download_count + 1 WHERE id = %s", (attachment_id,))
            conn.commit()
            cur.close()
            conn.close()
            logger.info(f"📎 Download tracked: campaign={campaign_id} target={target_email}")
        except Exception as e:
            logger.error(f"Download track error: {e}")
    return render_template_string(AWARENESS_PAGE, message='Este arquivo era uma simulação de phishing. Cuidado com downloads de fontes desconhecidas!')


# =====================================================
# TRAINING PORTAL
# =====================================================
@app.route('/training/<token>')
def training_portal(token):
    """Render training content for enrolled user."""
    try:
        decoded = base64.urlsafe_b64decode(token + '==').decode('utf-8')
        parts = decoded.split(':')
        enrollment_id = int(parts[0]) if parts else None
    except Exception:
        return "Invalid token", 404

    if not enrollment_id:
        return "Training not found", 404

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT te.id, te.status, t.title, t.description, t.content_url, t.duration_minutes
            FROM training_enrollments te
            JOIN trainings t ON t.id = te.training_id
            WHERE te.id = %s
        """, (enrollment_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return "Training not found", 404

        if row['status'] == 'not_started':
            cur.execute("UPDATE training_enrollments SET status = 'in_progress', started_at = NOW() WHERE id = %s", (enrollment_id,))
            conn.commit()

        cur.close()
        conn.close()
        return render_template_string(TRAINING_PAGE, training=row, token=token)
    except Exception as e:
        logger.error(f"Training portal error: {e}")
        return "An error occurred", 500


@app.route('/training/<token>/complete', methods=['POST'])
def training_complete(token):
    """Mark training as completed."""
    try:
        decoded = base64.urlsafe_b64decode(token + '==').decode('utf-8')
        enrollment_id = int(decoded.split(':')[0])
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            UPDATE training_enrollments SET status = 'completed', completed_at = NOW()
            WHERE id = %s AND status != 'completed'
        """, (enrollment_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {'success': True, 'message': 'Treinamento concluído!'}
    except Exception as e:
        logger.error(f"Training complete error: {e}")
        return {'success': False, 'error': str(e)}, 500


# =====================================================
# HTML TEMPLATES
# =====================================================
AWARENESS_PAGE = """<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alerta de Segurança</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff}
.card{background:rgba(255,255,255,.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);
border-radius:20px;padding:3rem;max-width:500px;text-align:center;box-shadow:0 25px 45px rgba(0,0,0,.3)}
.icon{font-size:4rem;margin-bottom:1.5rem}
h1{font-size:1.5rem;margin-bottom:1rem;color:#e94560}
p{color:rgba(255,255,255,.8);line-height:1.6;margin-bottom:1.5rem}
.badge{background:#e94560;color:#fff;padding:.5rem 1.5rem;border-radius:25px;display:inline-block;
font-weight:600;font-size:.85rem}
.footer{margin-top:2rem;font-size:.75rem;color:rgba(255,255,255,.4)}
</style></head><body>
<div class="card">
<div class="icon">🛡️</div>
<h1>Simulação de Phishing</h1>
<p>{{ message or 'Esta página faz parte de uma campanha de conscientização em segurança da informação. Nenhuma informação real foi comprometida.' }}</p>
<div class="badge">⚠️ Treinamento de Segurança</div>
<p class="footer">Plataforma Matreiro — Under Protection</p>
</div></body></html>"""

TRAINING_PAGE = """<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ training.title }} — Treinamento</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f0f2f5;min-height:100vh}
.header{background:linear-gradient(135deg,#242545,#834a8b);color:#fff;padding:2rem 2rem 3rem;text-align:center}
.header h1{font-size:1.8rem;margin-bottom:.5rem}
.header p{opacity:.8}
.content{max-width:800px;margin:-1.5rem auto 2rem;padding:0 1rem}
.card{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:1.5rem}
.btn{background:linear-gradient(135deg,#834a8b,#e94560);color:#fff;border:none;padding:.8rem 2rem;
border-radius:10px;font-size:1rem;cursor:pointer;font-weight:600;width:100%}
.btn:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 4px 15px rgba(131,74,139,.4)}
.meta{display:flex;gap:1rem;margin-top:1rem;font-size:.85rem;color:#666}
.meta span{background:#f0f2f5;padding:.3rem .8rem;border-radius:20px}
</style></head><body>
<div class="header"><h1>{{ training.title }}</h1><p>{{ training.description }}</p>
<div class="meta"><span>⏱ {{ training.duration_minutes }} min</span></div></div>
<div class="content">
<div class="card">
<h2>📚 Conteúdo do Treinamento</h2>
<p style="margin-top:1rem;color:#555">{{ training.description }}</p>
{% if training.content_url %}<iframe src="{{ training.content_url }}" style="width:100%;height:400px;border:none;margin-top:1rem;border-radius:8px"></iframe>{% endif %}
</div>
<div class="card"><button class="btn" onclick="completeTraining()">✅ Concluir Treinamento</button></div>
</div>
<script>
async function completeTraining(){
  const r=await fetch('/training/{{ token }}/complete',{method:'POST'});
  const d=await r.json();
  if(d.success){alert('Parabéns! Treinamento concluído!');location.reload()}
  else{alert('Erro: '+d.error)}
}
</script></body></html>"""


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

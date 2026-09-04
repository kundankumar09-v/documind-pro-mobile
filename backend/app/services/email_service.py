"""
email_service.py
────────────────
Sends OTP emails via Gmail SMTP using an App Password.
Uses only Python's built-in smtplib + ssl — no extra pip packages needed.

Setup (one-time):
  1. Enable 2-Step Verification on your Google Account.
  2. Go to https://myaccount.google.com/apppasswords
  3. Generate an App Password for Mail / Windows Computer.
  4. Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env
"""

import os
import ssl
import smtplib
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ─── Config (loaded from .env via python-dotenv in main.py) ─────────────────
GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")

# Placeholder values written to .env before configuration
_PLACEHOLDERS = {"your_gmail@gmail.com", "your_16_char_app_password", ""}

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465  # SSL port


def _build_html(otp: str, recipient_email: str) -> str:
    """Return a polished HTML email body for the OTP."""
    digits_html = "".join(
        f'<span style="'
        f'display:inline-block;width:44px;height:52px;line-height:52px;'
        f'text-align:center;font-size:26px;font-weight:700;'
        f'background:#0f172a;color:#06b6d4;border:2px solid #1e3a5f;'
        f'border-radius:8px;margin:0 4px;letter-spacing:0;font-family:monospace;">'
        f'{ch}</span>'
        for ch in otp
    )
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DocuMind — Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#0b1120;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#0f172a 0%,#0d1e35 100%);
                      border-radius:16px;border:1px solid #1e3a5f;
                      box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#0c2a4a,#0a1f35);
                       padding:32px 40px;text-align:center;border-bottom:1px solid #1e3a5f;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:8px;
                            background:linear-gradient(135deg,#06b6d4,#0284c7);
                            display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:18px;">🔐</span>
                </div>
                <span style="font-size:22px;font-weight:800;color:#e2e8f0;
                             letter-spacing:-0.5px;">Docu<span style="color:#06b6d4;">Mind</span></span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#e2e8f0;font-size:22px;font-weight:700;">
                Verify your email address
              </h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Hi there! Use the one-time code below to verify
                <strong style="color:#e2e8f0;">{recipient_email}</strong>
                and activate your DocuMind account.
                This code expires in <strong style="color:#06b6d4;">10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin:0 0 32px;padding:28px 20px;
                          background:#080f1e;border-radius:12px;border:1px solid #1e3a5f;">
                <p style="margin:0 0 16px;color:#64748b;font-size:12px;
                           text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                  Your verification code
                </p>
                <div style="margin:0 0 16px;">
                  {digits_html}
                </div>
                <p style="margin:0;color:#475569;font-size:11px;">
                  ⏱ Valid for 10 minutes only
                </p>
              </div>

              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                If you didn't create a DocuMind account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #1e3a5f;text-align:center;">
              <p style="margin:0;color:#334155;font-size:11px;">
                © 2025 DocuMind · Sent to {recipient_email}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _smtp_send(recipient_email: str, msg_string: str) -> bool:
    """Blocking SMTP call — runs in a thread via asyncio.to_thread."""
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=10) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, recipient_email, msg_string)
        return True
    except smtplib.SMTPAuthenticationError:
        print("[EMAIL] ❌ Gmail auth failed. Check GMAIL_USER & GMAIL_APP_PASSWORD in .env")
        return False
    except Exception as exc:
        print(f"[EMAIL] ❌ SMTP error: {exc}")
        return False


async def send_otp_email(recipient_email: str, otp: str) -> bool:
    """
    Send the OTP to recipient_email via Gmail SMTP (SSL, port 465).
    Runs the blocking SMTP call in a thread to avoid blocking the async event loop.

    Returns:
        True  – email sent successfully
        False – credentials not configured, or SMTP error (caller falls back to console)
    """
    # ── Guard: skip if credentials are missing or still placeholder values ──
    if GMAIL_USER in _PLACEHOLDERS or GMAIL_APP_PASSWORD in _PLACEHOLDERS:
        return False

    # Build the message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔐 {otp} is your DocuMind verification code"
    msg["From"] = f"DocuMind <{GMAIL_USER}>"
    msg["To"] = recipient_email

    plain_text = (
        f"Your DocuMind verification code is: {otp}\n\n"
        f"This code expires in 10 minutes.\n"
        f"If you didn't sign up, ignore this email."
    )
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(_build_html(otp, recipient_email), "html"))

    # Run blocking SMTP call in a thread pool so the async event loop stays free
    return await asyncio.to_thread(_smtp_send, recipient_email, msg.as_string())


def _build_reset_html(token: str, recipient_email: str) -> str:
    """Return an HTML email body with the reset link."""
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DocuMind — Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0b1120;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#0f172a 0%,#0d1e35 100%);
                      border-radius:16px;border:1px solid #1e3a5f;
                      box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#0c2a4a,#0a1f35);
                       padding:32px 40px;text-align:center;border-bottom:1px solid #1e3a5f;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:8px;
                            background:linear-gradient(135deg,#06b6d4,#0284c7);
                            display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:18px;">🔐</span>
                </div>
                <span style="font-size:22px;font-weight:800;color:#e2e8f0;
                             letter-spacing:-0.5px;">Docu<span style="color:#06b6d4;">Mind</span></span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#e2e8f0;font-size:22px;font-weight:700;">
                Reset your password
              </h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.6;">
                We received a request to reset the password for
                <strong style="color:#e2e8f0;">{recipient_email}</strong>.
                Click the button below to choose a new password. This link expires in <strong style="color:#06b6d4;">15 minutes</strong>.
              </p>

              <!-- Reset Button -->
              <div style="text-align:center;margin:0 0 32px;">
                <a href="{reset_link}" 
                   style="display:inline-block;padding:14px 32px;
                          background:linear-gradient(135deg,#7c3aed,#9333ea);
                          color:#ffffff;font-weight:600;text-decoration:none;
                          border-radius:8px;font-size:15px;letter-spacing:0.5px;">
                  Reset Password
                </a>
              </div>

              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not change.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #1e3a5f;text-align:center;">
              <p style="margin:0;color:#334155;font-size:11px;">
                © 2025 DocuMind · Sent to {recipient_email}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_reset_email(recipient_email: str, token: str) -> bool:
    """Send the password reset link to recipient_email via Gmail SMTP."""
    if GMAIL_USER in _PLACEHOLDERS or GMAIL_APP_PASSWORD in _PLACEHOLDERS:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔐 Reset your DocuMind password"
    msg["From"] = f"DocuMind <{GMAIL_USER}>"
    msg["To"] = recipient_email

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    plain_text = (
        f"Reset your DocuMind password by clicking this link: {reset_link}\n\n"
        f"This link expires in 15 minutes.\n"
        f"If you didn't request a password reset, ignore this email."
    )
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(_build_reset_html(token, recipient_email), "html"))

    return await asyncio.to_thread(_smtp_send, recipient_email, msg.as_string())

import os
import secrets
import time
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
OTP_TTL = 300

# Temporary OTP storage
otp_storage = {}

def generate_otp():
	return str(secrets.randbelow(900000) + 100000)

def send_otp_email(to_email: str, otp: str):
	msg = EmailMessage()
	msg["From"] = MAIL_USERNAME
	msg["To"] = to_email
	msg["Subject"] = "Email Verification OTP"
	msg.set_content(
		f"""
		Hello,

		Your OTP is: {otp}

		This OTP is valid for 5 minutes.

		Do not share this OTP with anyone.
		"""
	)
	with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
		server.login(MAIL_USERNAME, MAIL_PASSWORD)
		server.send_message(msg)

def create_otp(email: str):
	otp = generate_otp()
	otp_storage[email] = {
		"otp": otp,
		"expires_at": time.time() + OTP_TTL
	}
	return otp


def verify_otp(email: str, entered_otp: str):
	data = otp_storage.get(email)
	if not data:
		return False
	if time.time() > data["expires_at"]:
		otp_storage.pop(email, None)
		return False
	if not secrets.compare_digest(data["otp"], entered_otp):
		return False
	# OTP can only be used once
	otp_storage.pop(email, None)
	return True
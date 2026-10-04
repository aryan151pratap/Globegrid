import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from starlette.concurrency import run_in_threadpool

load_dotenv()

app = FastAPI()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")


class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str


def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = MAIL_USERNAME
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)


@app.post("/send-mail")
async def send_mail(data: EmailRequest):
    try:
        await run_in_threadpool(
            send_email,
            data.to_email,
            data.subject,
            data.body
        )

        return {
            "success": True,
            "message": "Email sent successfully"
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to send email"
        )
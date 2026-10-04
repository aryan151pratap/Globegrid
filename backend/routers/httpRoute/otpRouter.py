from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from starlette.concurrency import run_in_threadpool
from mail.otp import create_otp, send_otp_email, verify_otp, OTP_TTL

router = APIRouter(prefix="/auth", tags=["Authentication"])

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str


@router.post("/send-otp")
async def send_otp(data: OTPRequest):
    otp = create_otp(data.email)
    try:
        await run_in_threadpool(
            send_otp_email,
            data.email,
            otp
        )
        return {
            "success": True,
            "message": "OTP sent successfully",
            "expire_at": OTP_TTL
        }
    
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP"
        )


@router.post("/verify-otp")
async def verify_email_otp(data: OTPVerify):

    if not data.otp.isdigit() or len(data.otp) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP format"
        )

    if not verify_otp(data.email, data.otp):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    return {
        "success": True,
        "verified": True,
        "message": "Email verified successfully"
    }
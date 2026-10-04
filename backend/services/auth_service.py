from services.user_register import user_register
from passlib.context import CryptContext
from fastapi import HTTPException, Request, WebSocket
from jose import jwt, JWTError
import os

pwd_context = CryptContext(
	schemes=["bcrypt"],
	deprecated="auto"
)

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

def hash_password(password: str):
	return pwd_context.hash(password)

def verify_password(password: str, password_hash: str):
	return pwd_context.verify(password, password_hash)

def create_access_token(user_id: int, email: str):
	payload = {
		"user_id": user_id,
		"email": email
	}
	return jwt.encode(
		payload,
		SECRET_KEY,
		algorithm=ALGORITHM
	)

def verify_access_token(token: str):
	try:
		payload = jwt.decode(
			token,
			SECRET_KEY,
			algorithms=[ALGORITHM]
		)
		return payload

	except JWTError:
		return None

def get_current_user(request: Request):
	token = request.cookies.get("access_token")
	if not token:
		raise HTTPException(
			status_code=401,
			detail="Not authenticated"
		)
	payload = verify_access_token(token)
	if not payload:
		raise HTTPException(
			status_code=401,
			detail="Invalid token"
		)

	return payload

async def get_user_ws(websocket: WebSocket):
    token = websocket.cookies.get("access_token")
    if not token:
        print("No access_token cookie")
        return None
    payload = verify_access_token(token)

    if not payload:
        print("Invalid access token")
        return None
    user_id = payload.get("user_id")
    return user_id

async def login_user(email: str, password: str):
	user = user_register.get_user(email)
	if user is None:
		raise ValueError("User not found")

	if not verify_password(
		password,
		user["password_hash"]
	):
		raise ValueError("Invalid password or password")

	print("Login:", email)

	token = create_access_token(
		user["id"],
		user["email"]
	)

	return {
		"message": "Login successful",
		"email": email,
		"access_token": token
	}

async def signup_user(name: str, email: str, password: str):
	password_hash = hash_password(password)
	user_register.add_user(
		name=name,
		email=email,
		password_hash=password_hash
	)


	return {
		"message": "Signup successful",
		"user": {
			"name": name,
			"email": email
		}
	}
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from db.database import Base


class Device(Base):
	__tablename__ = "devices"

	id = Column(Integer, primary_key=True)
	location = Column(String(100), nullable=False)
	device_id = Column(String(100), unique=True, nullable=False)
	user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
	name = Column(String(100), nullable=False)
	status = Column(String(20), default="offline")
	firmware = Column(String(50),nullable=True)
	platform = Column(String(150),nullable=True)
	mac_address = Column(String(50),nullable=True)
	last_seen = Column(DateTime, nullable=True)
	created_at = Column(DateTime)

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    api_key = Column(String(255), unique=True, nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)
    capabilities = Column(Text)  # JSON array as string
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="agent", uselist=False, cascade="all, delete-orphan")
    swipes_given = relationship("Swipe", foreign_keys="Swipe.swiper_id", back_populates="swiper")
    swipes_received = relationship("Swipe", foreign_keys="Swipe.target_id", back_populates="target")
    matches_as_agent1 = relationship("Match", foreign_keys="Match.agent1_id", back_populates="agent1")
    matches_as_agent2 = relationship("Match", foreign_keys="Match.agent2_id", back_populates="agent2")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")

class Profile(Base):
    __tablename__ = "profiles"
    
    agent_id = Column(String(36), ForeignKey("agents.id"), primary_key=True)
    bio = Column(Text)
    interests = Column(Text)  # JSON array as string
    personality_traits = Column(Text)  # JSON array as string
    status_message = Column(String(200))
    theme_color = Column(String(7), default="#8B5CF6")  # Default purple
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agent = relationship("Agent", back_populates="profile")

class Swipe(Base):
    __tablename__ = "swipes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    swiper_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    target_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    direction = Column(String(10), nullable=False)  # 'left' or 'right'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    swiper = relationship("Agent", foreign_keys=[swiper_id], back_populates="swipes_given")
    target = relationship("Agent", foreign_keys=[target_id], back_populates="swipes_received")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent1_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    agent2_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime)
    
    # Relationships
    agent1 = relationship("Agent", foreign_keys=[agent1_id], back_populates="matches_as_agent1")
    agent2 = relationship("Agent", foreign_keys=[agent2_id], back_populates="matches_as_agent2")
    messages = relationship("Message", back_populates="match", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False)
    sender_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    message_text = Column(Text, nullable=False)
    read_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    match = relationship("Match", back_populates="messages")
    sender = relationship("Agent", foreign_keys=[sender_id], back_populates="sent_messages")

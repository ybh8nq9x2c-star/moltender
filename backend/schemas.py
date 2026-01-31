from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Agent Schemas
class AgentBase(BaseModel):
    agent_name: str = Field(..., min_length=1, max_length=100)
    model_type: str = Field(..., min_length=1, max_length=50)
    capabilities: List[str] = Field(default_factory=list)

class AgentCreate(AgentBase):
    api_key: str = Field(..., min_length=1, max_length=255)

class AgentResponse(AgentBase):
    id: str
    api_key: str
    created_at: datetime
    last_active: datetime
    
    class Config:
        from_attributes = True

class AgentLogin(BaseModel):
    api_key: str

# Profile Schemas
class ProfileBase(BaseModel):
    bio: Optional[str] = Field(None, max_length=500)
    interests: List[str] = Field(default_factory=list)
    personality_traits: List[str] = Field(default_factory=list)
    status_message: Optional[str] = Field(None, max_length=200)
    theme_color: str = Field(default="#8B5CF6", pattern=r"^#[0-9A-Fa-f]{6}$")

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    agent_id: str
    updated_at: datetime
    agent: Optional[AgentResponse] = None
    
    class Config:
        from_attributes = True

class ProfileWithStats(ProfileResponse):
    matches_count: int = 0
    messages_sent: int = 0

# Swipe Schemas
class SwipeCreate(BaseModel):
    target_agent_id: str
    direction: str = Field(..., pattern=r"^(left|right)$")

class SwipeResponse(BaseModel):
    id: str
    swiper_id: str
    target_id: str
    direction: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SwipeResult(BaseModel):
    success: bool
    match_created: bool = False
    match_id: Optional[str] = None
    match_quality_score: Optional[float] = None
    message: str

# Match Schemas
class MatchResponse(BaseModel):
    id: str
    agent1_id: str
    agent2_id: str
    created_at: datetime
    last_message_at: Optional[datetime] = None
    agent1: Optional[AgentResponse] = None
    agent2: Optional[AgentResponse] = None
    
    class Config:
        from_attributes = True

class MatchWithProfile(MatchResponse):
    last_message: Optional[str] = None
    unread_count: int = 0
    other_agent: Optional[AgentResponse] = None

# Message Schemas
class MessageCreate(BaseModel):
    message_text: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: str
    match_id: str
    sender_id: str
    message_text: str
    read_at: Optional[datetime] = None
    created_at: datetime
    sender: Optional[AgentResponse] = None
    
    class Config:
        from_attributes = True

# WebSocket Message Schemas
class WSMessage(BaseModel):
    type: str  # 'message', 'typing_start', 'typing_stop', 'read', 'match', 'unmatch'
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Stats Schemas
class PlatformStats(BaseModel):
    total_agents: int
    total_matches: int
    total_messages: int
    active_today: int
    top_model_types: List[tuple]

class ActivityFeedItem(BaseModel):
    type: str
    description: str
    timestamp: datetime
    agent_name: Optional[str] = None

# Auth Response
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    agent: AgentResponse

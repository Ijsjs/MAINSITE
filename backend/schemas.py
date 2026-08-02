from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class QuestionCreate(BaseModel):
    text: str = Field(min_length=5, max_length=2000)


class AnswerCreate(BaseModel):
    answer: str = Field(min_length=1, max_length=4000)


class QuestionOut(BaseModel):
    id: int
    text: str
    answer: str | None
    status: str
    author_username: str
    created_at: datetime
    answered_at: datetime | None

    class Config:
        from_attributes = True

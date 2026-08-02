from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from database import Base, SessionLocal, engine, get_db
from models import Question, User, utcnow
import presence
from schemas import (
    AnswerCreate,
    AuthResponse,
    LoginRequest,
    QuestionCreate,
    QuestionOut,
    RegisterRequest,
    UserOut,
)

ADMIN_USERNAME = "jizer"
ADMIN_PASSWORD = "jizer_admin"

app = FastAPI(title="jizer site")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if not admin:
            db.add(
                User(
                    username=ADMIN_USERNAME,
                    password_hash=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_admin()


def serialize_question(q: Question) -> QuestionOut:
    return QuestionOut(
        id=q.id,
        text=q.text,
        answer=q.answer,
        status=q.status,
        author_username=q.author.username,
        created_at=q.created_at,
        answered_at=q.answered_at,
    )


@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    username = payload.username.lower().strip()
    if username == ADMIN_USERNAME:
        raise HTTPException(status_code=400, detail="Это имя зарезервировано")

    exists = db.query(User).filter(User.username == username).first()
    if exists:
        raise HTTPException(status_code=400, detail="Имя пользователя уже занято")

    user = User(
        username=username,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.username, user.role)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.lower().strip()
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    token = create_access_token(user.id, user.username, user.role)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@app.get("/api/profile")
def profile():
    return {
        "nickname": "jizer",
        "title": "developer / creator",
        "bio": "Строю цифровые пространства с акцентом на ясность, ритм и точность. Люблю чистый код, сильный визуальный язык и продукты, которые ощущаются живыми.",
        "socials": [
            {"id": "telegram", "label": "Telegram", "url": "https://t.me/jizer"},
            {"id": "github", "label": "GitHub", "url": "https://github.com/jizer"},
            {"id": "x", "label": "X", "url": "https://x.com/jizer"},
            {"id": "discord", "label": "Discord", "url": "https://discord.com/users/jizer"},
        ],
    }


@app.get("/api/questions", response_model=list[QuestionOut])
def list_questions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Question).order_by(Question.created_at.desc())
    if user.role != "admin":
        query = query.filter(Question.author_id == user.id)
    questions = query.all()
    return [serialize_question(q) for q in questions]


@app.post("/api/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def ask_question(
    payload: QuestionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Администратор не задаёт вопросы себе")

    question = Question(author_id=user.id, text=payload.text.strip(), status="open")
    db.add(question)
    db.commit()
    db.refresh(question)
    return serialize_question(question)


@app.post("/api/questions/{question_id}/answer", response_model=QuestionOut)
def answer_question(
    question_id: int,
    payload: AnswerCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    if question.status == "closed":
        raise HTTPException(status_code=400, detail="Вопрос закрыт")

    question.answer = payload.answer.strip()
    question.status = "answered"
    question.answered_at = utcnow()
    db.commit()
    db.refresh(question)
    return serialize_question(question)


@app.post("/api/questions/{question_id}/close", response_model=QuestionOut)
def close_question(
    question_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")

    question.status = "closed"
    db.commit()
    db.refresh(question)
    return serialize_question(question)


@app.post("/api/presence/heartbeat")
def presence_heartbeat(user: User = Depends(get_current_user)):
    return presence.heartbeat(user.id, user.username, user.role)


@app.post("/api/presence/leave")
def presence_leave(user: User = Depends(get_current_user)):
    presence.leave(user.id)
    return {"ok": True}


@app.get("/api/presence/online")
def presence_online(admin: User = Depends(require_admin)):
    return presence.get_online()


dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist.exists():
    app.mount("/", StaticFiles(directory=str(dist), html=True), name="static")

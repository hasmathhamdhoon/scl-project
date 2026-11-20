from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import router as auth_router
from app.database import allowed_origins, get_db, settings

app = FastAPI(title="Greenfield School API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(auth_router)


@app.middleware("http")
async def protect_cookie_requests(request: Request, call_next):
    if (
        request.method in {"POST", "PUT", "PATCH", "DELETE"}
        and settings.session_cookie_name in request.cookies
        and request.headers.get("origin") not in allowed_origins
    ):
        return JSONResponse(status_code=403, content={"detail": "Untrusted request origin"})
    return await call_next(request)


@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}

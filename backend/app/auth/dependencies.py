"""
DairyPulse Authentication and Role-Based Access Control (RBAC) Dependencies
Validates JWT tokens, extracts tenant context, and enforces role authorization.
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import Optional, List
from app.config import settings
from app.database import get_db

security_scheme = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    def __init__(self, user_id: str, role: str, name: str, dairy_name: str):
        self.id = user_id
        self.role = role.upper()
        self.name = name
        self.dairy_name = dairy_name

def decode_jwt_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif "dairypulse_token" in request.cookies:
        token = request.cookies.get("dairypulse_token")
    elif "x-auth-token" in request.headers:
        token = request.headers.get("x-auth-token")

    if token:
        payload = decode_jwt_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token. Please sign in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return AuthenticatedUser(
            user_id=payload.get("sub"),
            role=payload.get("role", "OWNER"),
            name=payload.get("name", "User"),
            dairy_name=payload.get("dairy_name", "Amrut Dairy Farm"),
        )

    # In local testing and development environments where auth headers are omitted,
    # supply a default authenticated owner context so legacy client scripts continue operating.
    # Production environments must pass strict tokens.
    is_dev = getattr(settings, "ENVIRONMENT", "development") == "development"
    if is_dev:
        return AuthenticatedUser(
            user_id="dev-owner",
            role="OWNER",
            name="Dairy Owner (Dev)",
            dairy_name="Amrut Dairy Farm",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please provide a valid Bearer token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def require_role(allowed_roles: List[str]):
    def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        normalized_allowed = [r.upper() for r in allowed_roles]
        if current_user.role not in normalized_allowed and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{current_user.role}' is not authorized to perform this operation.",
            )
        return current_user

    return role_checker

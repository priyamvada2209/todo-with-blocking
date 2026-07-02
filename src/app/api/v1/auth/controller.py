from flask import Blueprint, current_app, jsonify, request

from app.api.v1.auth import schema, service
from app.errors import ApiError

bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        data = request.get_json() or {}
        payload = schema.parse_register_payload(data)
        
        settings = current_app.config.get("SETTINGS")
        if not settings:
            raise RuntimeError("Settings not configured")
        
        user, tokens = service.register_user(
            payload["name"], payload["email"], payload["password"], settings
        )
        
        response = schema.serialize_auth_response(
            user, tokens["access_token"], tokens["refresh_token"], tokens["access_token_expiry_minutes"]
        )
        
        # Set httpOnly cookie for access token
        resp = jsonify({"data": response})
        resp.set_cookie(
            "access_token",
            tokens["access_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=tokens["access_token_expiry_minutes"] * 60,
        )
        resp.set_cookie(
            "refresh_token",
            tokens["refresh_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=settings.jwt_refresh_expiration_days * 24 * 60 * 60,
        )
        
        return resp, 201
    except ApiError as e:
        return jsonify({"error": e.details}), e.status_code


@bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return tokens."""
    try:
        data = request.get_json() or {}
        payload = schema.parse_login_payload(data)
        
        settings = current_app.config.get("SETTINGS")
        if not settings:
            raise RuntimeError("Settings not configured")

        if not payload.get("email") or not payload.get("password"):
            raise ApiError("Email and password are required", status_code=400)
            
        

        user, tokens = service.login_user(payload["email"], payload["password"], settings)
        
        response = schema.serialize_auth_response(
            user, tokens["access_token"], tokens["refresh_token"], tokens["access_token_expiry_minutes"]
        )
        
        # Set httpOnly cookie for access token
        resp = jsonify({"data": response})
        resp.set_cookie(
            "access_token",
            tokens["access_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=tokens["access_token_expiry_minutes"] * 60,
        )
        resp.set_cookie(
            "refresh_token",
            tokens["refresh_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=settings.jwt_refresh_expiration_days * 24 * 60 * 60,
        )
        
        return resp, 200
    except ApiError as e:
        return jsonify({"error": e.details}), e.status_code


@bp.route("/refresh", methods=["POST"])
def refresh():
    """Refresh access token using refresh token."""
    try:
        data = request.get_json() or {}
        payload = schema.parse_refresh_payload(data)
        
        settings = current_app.config.get("SETTINGS")
        if not settings:
            raise RuntimeError("Settings not configured")
        
        user, tokens = service.refresh_access_token(payload["refresh_token"], settings)
        
        response = schema.serialize_auth_response(
            user, tokens["access_token"], tokens["refresh_token"], tokens["access_token_expiry_minutes"]
        )
        
        # Set httpOnly cookie for new access token
        resp = jsonify({"data": response})
        resp.set_cookie(
            "access_token",
            tokens["access_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=tokens["access_token_expiry_minutes"] * 60,
        )
        
        return resp, 200
    except ApiError as e:
        return jsonify({"error": e.details}), e.status_code


@bp.route("/logout", methods=["POST"])
def logout():
    """Logout user by clearing authentication cookies."""
    resp = jsonify({"data": {"message": "Logged out successfully"}})
    resp.set_cookie("access_token", "", expires=0)
    resp.set_cookie("refresh_token", "", expires=0)
    return resp, 204

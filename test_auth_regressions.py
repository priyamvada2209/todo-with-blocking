import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from sqlalchemy.exc import IntegrityError

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from app.api.v1.auth.service import login_user, register_user
from app.errors import ApiError


class AuthErrorRegressionTests(unittest.TestCase):
    def setUp(self):
        self.settings = Mock(
            jwt_secret_key="test-secret",
            jwt_expiration_minutes=60,
            jwt_refresh_expiration_days=7,
        )

    @patch("app.api.v1.auth.service.generate_tokens", return_value={"access_token": "a", "refresh_token": "r", "access_token_expiry_minutes": 60})
    @patch("app.api.v1.auth.service.User")
    @patch("app.api.v1.auth.service.get_session")
    def test_duplicate_registration_returns_conflict_when_email_exists(self, mock_get_session, mock_user, _mock_tokens):
        session = Mock()
        mock_get_session.return_value = session
        session.query.return_value.filter.return_value.first.return_value = object()

        with self.assertRaises(ApiError) as context:
            register_user("Test User", "test@example.com", "TestPass123!", self.settings)

        self.assertEqual(context.exception.status_code, 409)
        self.assertEqual(context.exception.code, "EMAIL_EXISTS")
        self.assertEqual(context.exception.details["email"], "This email is already registered")
        session.commit.assert_not_called()
        mock_user.from_password.assert_not_called()

    @patch("app.api.v1.auth.service.generate_tokens", return_value={"access_token": "a", "refresh_token": "r", "access_token_expiry_minutes": 60})
    @patch("app.api.v1.auth.service.User")
    @patch("app.api.v1.auth.service.get_session")
    def test_duplicate_registration_rolls_back_integrity_error(self, mock_get_session, mock_user, _mock_tokens):
        session = Mock()
        user = Mock(id=1)
        mock_get_session.return_value = session
        session.query.return_value.filter.return_value.first.return_value = None
        session.commit.side_effect = IntegrityError("insert", {}, Exception("duplicate"))
        mock_user.from_password.return_value = user

        with self.assertRaises(ApiError) as context:
            register_user("Test User", "test@example.com", "TestPass123!", self.settings)

        self.assertEqual(context.exception.status_code, 409)
        self.assertEqual(context.exception.code, "EMAIL_EXISTS")
        session.rollback.assert_called_once()
        session.refresh.assert_not_called()

    @patch("app.api.v1.auth.service.generate_tokens", return_value={"access_token": "a", "refresh_token": "r", "access_token_expiry_minutes": 60})
    @patch("app.api.v1.auth.service.get_session")
    def test_wrong_password_returns_unauthorized(self, mock_get_session, _mock_tokens):
        session = Mock()
        user = Mock()
        user.verify_password.return_value = False
        mock_get_session.return_value = session
        session.query.return_value.filter.return_value.first.return_value = user

        with self.assertRaises(ApiError) as context:
            login_user("test@example.com", "WrongPass123!", self.settings)

        self.assertEqual(context.exception.status_code, 401)
        self.assertEqual(context.exception.code, "INVALID_CREDENTIALS")
        self.assertEqual(context.exception.message, "Invalid email or password")


if __name__ == "__main__":
    unittest.main()

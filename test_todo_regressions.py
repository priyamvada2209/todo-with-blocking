import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from app.api.v1.todos.service import update_todo
from app.errors import ApiError


class TodoRegressionTests(unittest.TestCase):
    @patch("app.api.v1.todos.service._get_todo_or_404")
    def test_completed_todo_cannot_be_edited(self, mock_get_todo):
        session = Mock()
        todo = Mock(is_completed=True)
        mock_get_todo.return_value = todo

        with self.assertRaises(ApiError) as context:
            update_todo(session, user_id=1, todo_id=99, updates={"task": "Updated task"})

        self.assertEqual(context.exception.status_code, 409)
        self.assertEqual(context.exception.code, "todo_completed")
        self.assertEqual(context.exception.message, "Completed todos cannot be edited.")
        session.commit.assert_not_called()
        session.refresh.assert_not_called()


if __name__ == "__main__":
    unittest.main()

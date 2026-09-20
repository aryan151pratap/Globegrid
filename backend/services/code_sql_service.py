import json
from sqlalchemy import text
from db.database import SessionLocal


class CodeService:

    @staticmethod
    def _load_files(raw):
        if isinstance(raw, str):
            raw = json.loads(raw)
        return raw or {}

    def add_code(
        self,
        user_id: int,
        name: str,
        description: str,
        files: dict,
        language: str = "react",
        device_id: int = None
    ):
        db = SessionLocal()

        try:
            query = text("""
                INSERT INTO projects (
                    user_id,
                    device_id,
                    name,
                    description,
                    files,
                    language,
                    created_at,
                    updated_at
                )
                VALUES (
                    :user_id,
                    :device_id,
                    :name,
                    :description,
                    :files,
                    :language,
                    NOW(),
                    NOW()
                )
            """)

            result = db.execute(
                query,
                {
                    "user_id": user_id,
                    "device_id": device_id,
                    "name": name,
                    "description": description,
                    "files": json.dumps(files),
                    "language": language
                }
            )
            new_id = result.lastrowid

            select_query = text("""
                SELECT id, user_id, device_id, name, description, files, language, created_at, updated_at
                FROM projects
                WHERE id = :id
            """)

            row = db.execute(select_query, {"id": new_id}).mappings().first()
            db.commit()
            row = dict(row)
            row["files"] = self._load_files(row["files"])
            return row

        except Exception as e:
            db.rollback()
            raise e

        finally:
            db.close()

    def get_code(self, project_id: int, user_id: int):
        db = SessionLocal()

        try:
            query = text("""
                SELECT id, user_id, device_id, name, description, files, language, created_at, updated_at
                FROM projects
                WHERE id = :project_id AND user_id = :user_id
            """)

            result = db.execute(
                query,
                {
                    "project_id": project_id,
                    "user_id": user_id
                }
            ).mappings().first()

            if not result:
                return None

            row = dict(result)
            row["files"] = self._load_files(row["files"])
            return row

        finally:
            db.close()

    def get_all_codes_with_files(self, user_id: int):
        db = SessionLocal()

        try:
            query = text("""
                SELECT id, user_id, device_id, name, description, files, language, created_at, updated_at
                FROM projects
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """)

            result = db.execute(query, {"user_id": user_id}).mappings().all()

            projects = []
            for r in result:
                row = dict(r)
                row["files"] = self._load_files(row["files"])
                projects.append(row)
            return projects

        finally:
            db.close()

    def get_all_codes(self, user_id: int):
        db = SessionLocal()

        try:
            query = text("""
                SELECT id, user_id, device_id, name, description, language, created_at, updated_at
                FROM projects
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """)

            result = db.execute(query, {"user_id": user_id}).mappings().all()
            return [dict(row) for row in result]

        finally:
            db.close()

    def update_code(
        self,
        project_id: int,
        user_id: int,
        name: str,
        description: str,
        files: dict,
        language: str,
        device_id: int = None
    ):

        db = SessionLocal()

        try:
            query = text("""
                UPDATE projects
                SET
                    name = :name,
                    description = :description,
                    files = :files,
                    language = :language,
                    device_id = :device_id,
                    updated_at = NOW()
                WHERE id = :project_id AND user_id = :user_id
            """)

            db.execute(
                query,
                {
                    "project_id": project_id,
                    "user_id": user_id,
                    "name": name,
                    "description": description,
                    "files": json.dumps(files),
                    "language": language,
                    "device_id": device_id
                }
            )

            db.commit()

        except Exception as e:
            db.rollback()
            raise e

        finally:
            db.close()

    def add_file(
        self,
        project_id: int,
        user_id: int,
        path: str,
        content=None
    ):
        db = SessionLocal()

        try:
            select_query = text("""
                SELECT files
                FROM projects
                WHERE id = :project_id AND user_id = :user_id
                FOR UPDATE
            """)

            result = db.execute(
                select_query,
                {"project_id": project_id, "user_id": user_id}
            ).mappings().first()

            if not result:
                raise ValueError(f"Project {project_id} not found for user {user_id}")

            files = self._load_files(result["files"])
            files[path] = content

            update_query = text("""
                UPDATE projects
                SET files = :files, updated_at = NOW()
                WHERE id = :project_id AND user_id = :user_id
            """)

            db.execute(
                update_query,
                {
                    "project_id": project_id,
                    "user_id": user_id,
                    "files": json.dumps(files),
                }
            )

            db.commit()
            return files

        except Exception as e:
            db.rollback()
            raise e

        finally:
            db.close()

    def delete_file(
        self,
        project_id: int,
        user_id: int,
        path: str
    ):
        db = SessionLocal()

        try:
            select_query = text("""
                SELECT files
                FROM projects
                WHERE id = :project_id AND user_id = :user_id
                FOR UPDATE
            """)

            result = db.execute(
                select_query,
                {"project_id": project_id, "user_id": user_id}
            ).mappings().first()

            if not result:
                raise ValueError(f"Project {project_id} not found for user {user_id}")

            files = self._load_files(result["files"])

            if path not in files:
                db.commit()
                return False

            del files[path]

            update_query = text("""
                UPDATE projects
                SET files = :files, updated_at = NOW()
                WHERE id = :project_id AND user_id = :user_id
            """)

            db.execute(
                update_query,
                {
                    "project_id": project_id,
                    "user_id": user_id,
                    "files": json.dumps(files),
                }
            )

            db.commit()
            return True

        except Exception as e:
            db.rollback()
            raise e

        finally:
            db.close()

    def delete_code(self, project_id: int, user_id: int):
        db = SessionLocal()

        try:
            query = text("""
                DELETE FROM projects
                WHERE id = :project_id AND user_id = :user_id
            """)

            db.execute(
                query,
                {
                    "project_id": project_id,
                    "user_id": user_id
                }
            )

            db.commit()

        except Exception as e:
            db.rollback()
            raise e

        finally:
            db.close()

code_service = CodeService()
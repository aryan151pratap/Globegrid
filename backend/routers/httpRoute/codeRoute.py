from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from services.auth_service import get_current_user
from services.code_sql_service import code_service
from template.codeData import get_react_esp32_template

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    files: dict
    language: str = "react"
    device_id: int | None = None


class ProjectUpdate(BaseModel):
    name: str
    description: str | None = None
    files: dict
    language: str
    device_id: int | None = None


class FileSavePayload(BaseModel):
    path: str
    content: str | None = None

class ProjectDetailsPayload(BaseModel):
    name: str | None = None
    description: str | None = None
    language: str | None = None
    device_id: str | None = None

@router.get("/project/template/{name}")
async def get_template(request: Request, name: str):
    template = get_react_esp32_template(name)
    payload = template if isinstance(template, ProjectCreate) else ProjectCreate(**template)
    result = await save_code(request, payload)
    return result

@router.post("/project/save")
async def save_code(request: Request, payload: ProjectCreate):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    user_id = user.get("user_id")
    result = code_service.add_code(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        files=payload.files,
        language=payload.language,
        device_id=payload.device_id,
    )
    return {"message": "saved", "project": result}


@router.get("/project/{project_id}")
async def get_code(project_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    project = code_service.get_code(project_id, user.get("user_id"))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.get("/projects")
async def list_code(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    user_id = user.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid user")

    return code_service.get_all_codes(user_id)

@router.get("/projects/with_files")
async def all_list_project(request: Request):
    user = get_current_user(request)
    if not user:
            raise HTTPException(status_code=401, detail="No user found")
    
    projects = code_service.get_all_codes_with_files(user.get("user_id"))
    if not projects:
        raise HTTPException(status_code=404, detail="Project not found")

    return projects


@router.put("/project/{project_id}")
async def update_code(project_id: int, payload: ProjectUpdate, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    code_service.update_code(
        project_id=project_id,
        user_id=user.user_id,
        name=payload.name,
        description=payload.description,
        files=payload.files,
        language=payload.language,
        device_id=payload.device_id,
    )

    return {"message": "updated"}


@router.put("/project/{project_id}/files")
async def save_file(project_id: int, payload: FileSavePayload, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    try:
        files = code_service.add_file(
            project_id=project_id,
            user_id=user.get("user_id"),
            path=payload.path,
            content=payload.content,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "file saved", "files": files}

@router.delete("/project/{project_id}/files")
async def delete_file(project_id: int, path: str, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")
 
    try:
        deleted = code_service.delete_file(
            project_id=project_id,
            user_id=user.get("user_id"),
            path=path,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Project not found")
 
    if not deleted:
        raise HTTPException(status_code=404, detail="File not found in project")
 
    return {"message": "file deleted"}

@router.put("/project/{project_id}/details")
async def update_project_details(project_id: int, payload: ProjectDetailsPayload, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    fields = payload.model_dump(exclude_unset=True)

    try:
        project = code_service.update_details(project_id, user.get("user_id"), fields)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "updated", "project": project}

@router.delete("/project/{project_id}")
async def delete_code(project_id: int, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="No user found")

    code_service.delete_code(project_id, user.get("user_id"))
    return {"message": "deleted"}
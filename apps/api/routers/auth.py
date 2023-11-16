from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from auth.jwt import create_access_token
from utils import CONTEXT_TOKEN

router = APIRouter(prefix="/v1/auth")


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.password != CONTEXT_TOKEN:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    assecc_token = create_access_token(data={"sub": "context-builder"})
    return {"access_token": assecc_token, "token_type": "bearer"}

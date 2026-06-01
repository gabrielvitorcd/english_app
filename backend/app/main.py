from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from app.interfaces.api.subtitles import router as subtitles_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5200"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(subtitles_router)


@app.get("/health")
def estamos_online():
    return "ESTAMOS ONLINE!"
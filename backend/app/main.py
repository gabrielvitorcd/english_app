from fastapi import FastAPI
from app.interfaces.api.subtitles import router as subtitles_router

app = FastAPI()

app.include_router(subtitles_router)


@app.get("/health")
def estamos_online():
    return "ESTAMOS ONLINE!"
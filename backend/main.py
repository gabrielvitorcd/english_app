from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def estamos_online():
    return "OK"
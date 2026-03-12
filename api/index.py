from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
def health_check():
    return {"status": "RoyaleScore API is live", "game": "Basketball"}

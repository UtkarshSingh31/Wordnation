from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import vocab

def create_app()->FastAPI:
    
    app=FastAPI(
        title="Vocab Tutor API",
        description="API for vocablury eplnation and examples",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health",tags=["system"])
    def health():
        return {"status":"ok"}
    
    app.include_router(vocab.router,prefix="/v1/vocab",tags=["Vocabulary"])
    
    return app

app=create_app()

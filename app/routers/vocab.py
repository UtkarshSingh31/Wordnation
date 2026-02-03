from fastapi import APIRouter, HTTPException
from pydantic import BaseModel,Field
from app.services.llm.pipeline import final_chain
from app.schemas.chat import ChatResponse

router=APIRouter()

class vocabRequest(BaseModel):
    word:str=Field(description="Write a word you want meaning for")

@router.post("/meaning",response_model=ChatResponse)
async def get_vocab_meaning(payload:vocabRequest):
    try:
        result=final_chain.invoke({'word':payload.word})
        return result
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))



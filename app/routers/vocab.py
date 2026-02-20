from fastapi import APIRouter, HTTPException
from pydantic import BaseModel,Field
from app.services.llm.pipeline import final_chain
from app.schemas.chat import ChatResponse
from typing import List

router=APIRouter()

class vocabRequest(BaseModel):
    word:str=Field(description="Write a word you want meaning for")

class DailyVocabResponse(BaseModel):
    words: List[ChatResponse]

@router.post("/meaning",response_model=ChatResponse)
async def get_vocab_meaning(payload:vocabRequest):
    try:
        result=final_chain.invoke({'word':payload.word})
        return result
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@router.get("/daily", response_model=DailyVocabResponse)
async def get_daily_vocab():
    """
    Returns top 5 new vocabulary words to learn today.
    This is a mock endpoint - replace with your actual data source.
    """
    try:
        # Mock daily vocab words
        daily_words = [
            {
                "word": "Serendipity",
                "meaning_text": "The occurrence of events by chance in a happy or beneficial way",
                "memory_trick": "Finding good things by accident - like lucky coincidence",
                "examples": ["Meeting an old friend by serendipity at the airport", "It was pure serendipity that I found this amazing book"],
                "synonyms": ["luck", "chance", "fortune"],
                "antonyms": ["misfortune", "bad luck"]
            },
            {
                "word": "Ephemeral",
                "meaning_text": "(Of something) lasting for a very short time",
                "memory_trick": "Like a mayfly that lives only one day",
                "examples": ["The beauty of cherry blossoms is ephemeral", "Social media trends are often ephemeral"],
                "synonyms": ["fleeting", "transient", "temporary"],
                "antonyms": ["permanent", "lasting", "eternal"]
            },
            {
                "word": "Eloquent",
                "meaning_text": "Fluent or persuasive in speaking or writing",
                "memory_trick": "Able to express yourself beautifully with words",
                "examples": ["The speaker gave an eloquent speech", "Her eloquent writing captured everyone's attention"],
                "synonyms": ["articulate", "expressive", "fluent"],
                "antonyms": ["inarticulate", "silent"]
            },
            {
                "word": "Ubiquitous",
                "meaning_text": "Present, appearing, or found everywhere",
                "memory_trick": "You see it everywhere - like smartphones here, there, and everywhere",
                "examples": ["Smartphones are ubiquitous in modern society", "Coffee shops are ubiquitous in cities"],
                "synonyms": ["omnipresent", "widespread", "universal"],
                "antonyms": ["rare", "scarce", "uncommon"]
            },
            {
                "word": "Mellifluous",
                "meaning_text": "(Of a voice or words) sweet or musical; pleasant to hear",
                "memory_trick": "Sounds sweet like honey - 'melli' means honey in Latin",
                "examples": ["Her mellifluous voice was soothing", "The mellifluous sound of the violin"],
                "synonyms": ["melodious", "dulcet", "sweet"],
                "antonyms": ["harsh", "grating", "cacophonous"]
            }
        ]
        return DailyVocabResponse(words=daily_words)
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))



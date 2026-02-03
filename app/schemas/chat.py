from pydantic import BaseModel
from typing import List

class ChatResponse(BaseModel):
    word:str
    meaning_text:str
    memory_trick:str
    examples:List[str]
    synonyms:List[str]



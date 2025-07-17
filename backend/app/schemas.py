from pydantic import BaseModel

class WordRequest(BaseModel):
    word: str

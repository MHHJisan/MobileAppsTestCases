from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import os
from app.word_counter import transcribe_audio, count_occurrences

app = FastAPI()

UPLOAD_DIR = "audio_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/count-word")
async def count_word(word: str = Form(...), file: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        content = await file.read()
        with open(file_location, "wb") as f:
            f.write(content)

        print(f"[DEBUG] Saved file: {file_location} ({len(content)} bytes)")
        print(f"[DEBUG] Counting word: '{word}'")

        transcription = transcribe_audio(file_location)
        if not transcription:
            return {"transcription": "", "word": word, "count": 0, "message": "No recognizable speech found in audio."}
        count = count_occurrences(transcription, word)

        print(f"[DEBUG] Transcription: {transcription}")
        print(f"[DEBUG] Count of '{word}': {count}")

        return {
            "transcription": transcription,
            "word": word,
            "count": count
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

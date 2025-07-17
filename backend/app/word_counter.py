from pydub import AudioSegment
import speech_recognition as sr
import re

def transcribe_audio(file_path: str) -> str:
    # Convert to wav if necessary
    if not file_path.lower().endswith(".wav"):
        wav_path = file_path.rsplit(".", 1)[0] + ".wav"
        audio = AudioSegment.from_file(file_path)
        audio.export(wav_path, format="wav")
    else:
        wav_path = file_path

    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)

    try:
        transcription = recognizer.recognize_google(audio_data)
        return transcription
    except sr.UnknownValueError:
        return ""
    except sr.RequestError as e:
        raise RuntimeError(f"Speech recognition service error: {e}")


def count_occurrences(text: str, word: str) -> int:
    if not text or not word:
        return 0
    # Normalize case
    text = text.lower()
    word = word.lower()
    # Remove punctuation from text
    text = re.sub(r'[^\w\s]', '', text)
    # Split into words
    words = text.split()
    return words.count(word)


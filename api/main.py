from tensorflow.keras.preprocessing.sequence import pad_sequences
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from pydantic import BaseModel, Field

from keras.models import load_model

import numpy as np
import pickle


# Constants

MODEL_PATH = "models/bigru_model/bigru_model.keras"

TOKENIZER_PATH = "models/bigru_model/tokenizer.pkl"

MAX_SEQUENCE_LENGTH = 50

EMOTION_LABELS = [
    "sadness",
    "joy",
    "love",
    "anger",
    "fear",
    "surprise"
]

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = text.strip()

    return text

class TextInput(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The sentence to analyze",
        json_schema_extra={
            "example": "I feel so happy and excited"
        }
    )

class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    confidence: float
    all_probabilities: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


"""
Model Loading and LifeSpan Management
Load the model and toknizer once the server starts up.
loaded_models
     │
     ├── "BiGRU" → trained model
     │
     └── "Tokenizer" → tokenizer
"""
loaded_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Loading BiGRU model and tokenizer...")

    loaded_models["BiGRU"] = load_model(MODEL_PATH)

    with open(TOKENIZER_PATH, "rb") as file:
        loaded_models["Tokenizer"] = pickle.load(file)

    print("BiGRU model and tokenizer loaded successfully.")

    yield ##Startup is complete. Now keep the application running and handle requests. The function pauses at yield

    loaded_models.clear()

    print("Resources cleared.")


app = FastAPI(
    title="Emotion Classification API",
    description="""
API for emotion classification using a trained BiGRU model.

The API accepts text and predicts one of six emotions:
sadness, joy, love, anger, fear, or surprise.
""",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)

app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)

@app.get("/", include_in_schema=False)
def home():
    return FileResponse("frontend/index.html")

# health endpoint to check if the model and tokenizer are loaded successfully

@app.get("/health", response_model=HealthResponse)
def health_check():

    model_loaded = (
        loaded_models.get("BiGRU") is not None
        and loaded_models.get("Tokenizer") is not None
    )

    return HealthResponse(
        status="Server is running",
        model_loaded=model_loaded
    )

#prediction endpoint to predict the emotion of the input text

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_emotion(text_input: TextInput):

    BiGRU_model = loaded_models.get("BiGRU")
    tokenizer_model = loaded_models.get("Tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet."
        )

    # 1. Preprocess
    cleaned_text = preprocess_text(
        text_input.text
    )

    # 2. Tokenization
    tokenized_text = tokenizer_model.texts_to_sequences(
        [cleaned_text]
    )

    # 3. Padding
    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=MAX_SEQUENCE_LENGTH,
        padding="post",
        truncating="post"
    )

    # 4. Prediction
    probabilities = BiGRU_model.predict(
        padded_sequence,
        verbose=0
    )[0]

    # 5. Get predicted class
    predicted_index = int(
        np.argmax(probabilities)
    )

    predicted_emotion = EMOTION_LABELS[
        predicted_index
    ]

    # 6. Probability of every emotion
    all_probabilities = {
        label: float(probability)
        for label, probability
        in zip(EMOTION_LABELS, probabilities)
    }

    # 7. Return response
    return PredictionResponse(
        text=text_input.text,
        predicted_emotion=predicted_emotion,
        confidence=float(
            probabilities[predicted_index]
        ),
        all_probabilities=all_probabilities
    )



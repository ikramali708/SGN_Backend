import logging
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image

logger = logging.getLogger(__name__)

# PlantVillage / Kaggle "New Plant Diseases Dataset" — 38 classes in the same order as
# `ImageDataGenerator(...).flow_from_directory` (sorted class subfolder names) and as the
# Harimitra model's published `class_name` list (see sudhir75/Harimitra main.py on Hugging Face).
PLANT_VILLAGE_LABELS = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

MODEL_PATH = Path(__file__).resolve().parent / "model.h5"
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if not MODEL_PATH.is_file():
        msg = f"Model file not found: {MODEL_PATH}"
        logger.error(msg)
        raise RuntimeError(msg)
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("Loaded Keras model from %s", MODEL_PATH)
    except Exception:
        logger.exception("Failed to load Keras model from %s", MODEL_PATH)
        raise
    yield
    model = None


app = FastAPI(lifespan=lifespan)


@app.get("/")
def root():
    return "API is running"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    raw = await file.read()
    image = Image.open(BytesIO(raw))
    image = image.convert("RGB")
    image = image.resize((128, 128))
    arr = np.asarray(image, dtype=np.float32) / 255.0
    batch = np.expand_dims(arr, axis=0)
    predictions = model.predict(batch, verbose=0)
    class_id = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))
    if 0 <= class_id < len(PLANT_VILLAGE_LABELS):
        disease_name = PLANT_VILLAGE_LABELS[class_id]
    else:
        disease_name = "Unknown"
    return {
        "disease_name": disease_name,
        "class_id": class_id,
        "confidence": confidence,
    }

# Emotion Classification using Deep Learning

An end-to-end Natural Language Processing project for classifying text into six emotions using Deep Learning models, with a FastAPI backend and a responsive HTML/CSS/JavaScript frontend.

## Project Overview

The goal of this project is to build an emotion classification system that takes a text sentence as input and predicts its emotional category.

The project compares a traditional NLP baseline with multiple recurrent neural network architectures and deploys the final BiGRU model as a REST API.

### Supported Emotions

- Sadness
- Joy
- Love
- Anger
- Fear
- Surprise

---

## Project Pipeline

```text
Raw Dataset
     ↓
Exploratory Data Analysis
     ↓
Text Preprocessing
     ↓
Train / Validation / Test Split
     ↓
TF-IDF + Logistic Regression Baseline
     ↓
Simple RNN
     ↓
LSTM
     ↓
GRU
     ↓
Bidirectional GRU
     ↓
Model Evaluation
     ↓
Error Analysis
     ↓
FastAPI Backend
     ↓
HTML / CSS / JavaScript Frontend

The final BiGRU model is served through a FastAPI API and accessed through an HTML/CSS/JavaScript frontend.

Dataset

The project uses the dair-ai/emotion dataset.

16,000 training samples
2,000 test samples
6 emotion classes
Deep Learning Model

The final model uses a Bidirectional GRU architecture:

Embedding
    ↓
Bidirectional GRU (128)
    ↓
Dropout
    ↓
Bidirectional GRU (64)
    ↓
Dropout
    ↓
Dense (6 classes + Softmax)
Evaluation

Models are evaluated using:

Accuracy
Precision
Recall
Macro F1-score
Confusion Matrix

Error analysis is also performed to understand cases involving context, negation, and ambiguous expressions.

Tech Stack

Machine Learning / NLP

Python
TensorFlow
Keras
Scikit-learn

Backend

FastAPI
Uvicorn
Pydantic

Frontend

HTML
CSS
JavaScript

Tools

Jupyter Notebook
Git
GitHub
Project Structure
DL_NLP_PROJECT/
│
├── api/
├── frontend/
├── models/
├── notebooks/
├── data/
├── requirements.txt
├── .gitignore
└── README.md
Run Locally

Install dependencies:

pip install -r requirements.txt

Start the API:

uvicorn api.main:app --reload

Open:

http://127.0.0.1:8000/

API documentation:

http://127.0.0.1:8000/docs

Future Improvements
Improve handling of negation and context
Hyperparameter tuning
Confidence calibration
Experiment with transformer-based models
Improve model performance through further error analysis
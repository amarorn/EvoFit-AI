"""
Servico local para o modelo PlayPart-AI-Personal-Trainer.
Expone API compativel com o formato do Hugging Face Inference API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from deep_translator import GoogleTranslator
import torch

app = FastAPI(title="PlayPart-AI Local")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
)

MODEL_ID = "Lukamac/PlayPart-AI-Personal-Trainer"
tokenizer = None
model = None


class InferenceRequest(BaseModel):
    inputs: str
    parameters: dict = {}


class InferenceResponse(BaseModel):
    generated_text: str


def load_model():
    global tokenizer, model
    if model is None:
        print(f"Carregando modelo {MODEL_ID}...")
        tokenizer = GPT2Tokenizer.from_pretrained(MODEL_ID)
        model = GPT2LMHeadModel.from_pretrained(MODEL_ID)
        tokenizer.pad_token = tokenizer.eos_token
        model.eval()
        print("Modelo carregado.")


@app.on_event("startup")
async def startup():
    load_model()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/", response_model=InferenceResponse)
def generate(request: InferenceRequest):
    load_model()

    params = request.parameters or {}
    max_new_tokens = params.get("max_new_tokens", 300)
    temperature = params.get("temperature", 0.7)
    do_sample = params.get("do_sample", True)

    input_ids = tokenizer.encode(request.inputs, return_tensors="pt")
    input_len = input_ids.shape[1]

    with torch.no_grad():
        outputs = model.generate(
            input_ids,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=do_sample,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = outputs[0][input_len:]
    generated_text = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    target_lang = params.get("target_language") or params.get("target_lang")
    if target_lang and target_lang.lower() not in ("en", "english") and generated_text:
        try:
            generated_text = GoogleTranslator(source="auto", target=target_lang).translate(generated_text)
        except Exception:
            pass

    return InferenceResponse(generated_text=generated_text)

# PlayPart-AI - Servico Local

Roda o modelo Lukamac/PlayPart-AI-Personal-Trainer localmente com FastAPI e Transformers.

## Requisitos

- Python 3.10+
- ~500 MB de disco (modelo + dependencias)
- ~2 GB de RAM

## Instalacao

```bash
cd services/ai-model
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

## Executar

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

O servico ficara em http://localhost:8000

## Configurar o EvoFit-AI

No `packages/backend/.env`:

```
HUGGINGFACE_API_URL=http://localhost:8000/
HUGGINGFACE_API_KEY=local
```

O backend ignora a API key quando a URL e localhost. Reinicie o backend apos subir o servico Python.

## Endpoints

- `GET /health` - Health check
- `POST /` - Geracao de texto (formato Hugging Face Inference API)

### Parametros opcionais (em `parameters`)

- `target_language` ou `target_lang` - Codigo do idioma de destino (ex: `pt` para portugues). Traduz a saida automaticamente via Google Translate. Ignorado se for `en` ou `english`.

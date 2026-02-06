# EvoFit-AI - Personal Trainer com IA

App de treino pessoal que utiliza IA para gerar planos personalizados. Desenvolvido conforme especificacoes do projeto AI Trainer Personal App.

## Estrutura

```
evofit-ai/
├── packages/
│   ├── backend/   # API NestJS (Clean Architecture)
│   └── web/       # Frontend React + Vite + TypeScript
├── docker-compose.yml
└── README.md
```

## Pre-requisitos

- Node.js 20+
- npm (ou pnpm/yarn)
- Docker (para PostgreSQL)

## Inicio rapido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Subir PostgreSQL

```bash
npm run docker:up
```

### 3. Configurar variaveis de ambiente do backend

```bash
cp packages/backend/.env.example packages/backend/.env
# Edite packages/backend/.env se necessario
```

### 4. Rodar em desenvolvimento

Em um terminal:

```bash
npm run dev:backend
```

Em outro terminal:

```bash
npm run dev:web
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Web: http://localhost:5173

## Stack Tecnologica

### Backend
- NestJS 10 + TypeScript
- TypeORM + PostgreSQL
- JWT para autenticacao
- Hugging Face Inference API (PlayPart-AI-Personal-Trainer)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Axios

## Design System

Paleta conforme Guia de Identidade Visual:
- Azul Profundo (Primary): #0D1B2A
- Ciano Vibrante (Accent): #00FFFF
- Cinza Medio (Secondary): #415A77
- Cinza Claro (Background): #E0E1DD
- Branco: #FFFFFF
- Tipografia: Poppins (titulos), Roboto (corpo)

## Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev:backend` | Roda o backend |
| `npm run dev:web` | Roda o frontend |
| `npm run build` | Build de todos os pacotes |
| `npm run build:backend` | Build do backend |
| `npm run build:web` | Build do frontend |
| `npm run test` | Executa testes |
| `npm run docker:up` | Sobe PostgreSQL via Docker |
| `npm run docker:down` | Para o PostgreSQL |

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login

### Usuarios (autenticado)
- `GET /api/v1/users/me` - Perfil do usuario
- `PUT /api/v1/users/me` - Atualizar perfil

### Treinos (autenticado)
- `POST /api/v1/workouts/generate` - Gerar treino com IA
- `GET /api/v1/workouts` - Listar treinos
- `GET /api/v1/workouts/:id` - Detalhe do treino

### Progresso (autenticado)
- `POST /api/v1/progress/record` - Registrar execucao
- `GET /api/v1/progress` - Historico
- `GET /api/v1/progress/stats` - Estatisticas

## Modelo IA Local (PlayPart-AI)

Para rodar o modelo PlayPart-AI-Personal-Trainer localmente (evita erro 410 da API gratuita):

```bash
cd services/ai-model
python -m venv venv
source venv/bin/activate   # Linux/macOS | Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Configure no `packages/backend/.env`:

```
HUGGINGFACE_API_URL=http://localhost:8000/
HUGGINGFACE_API_KEY=local
```

Reinicie o backend. O chat e a geracao de treinos usarao o modelo local.

## Licenca

Projeto interno - EvoFit-AI

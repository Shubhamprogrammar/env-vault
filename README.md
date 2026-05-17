# 🌿 Env-Vault

> **The Ultimate Full-Stack Secure Secret & Environment Manager** with a premium dark-glassmorphic UI, a self-healing companion CLI, and AES-256-GCM authenticated encryption.

---

## ✨ Features

*   **🔒 AES-256-GCM Cryptographic Storage**: Secrets are dynamically encrypted on the fly with unique 96-bit random Initialization Vectors (`iv`) and cryptographic verification authentication tags. Raw secrets never touch the database.
*   **💻 Self-Healing Companion CLI**: High-speed full `.env` pushes and pulls. Integrated with a **silent token refresh interceptor** that automatically resolves expired access sessions.
*   **🎨 Premium Glassmorphic Web UI**: A beautiful user interface styled with custom Google Typography (`Outfit` & `Plus Jakarta Sans`) and a sleek Lush Forest color scheme.
*   **🔗 Git-like Workspace Linking**: Use `env-vault init <projectId>` inside a local directory to link it permanently. Daily pulls and pushes require **no project IDs**!
*   **🔑 Dual-Token Authentication**: Secure authentication using Access Tokens (15-min) and Refresh Tokens (7-day) that automatically sync across web cookies and terminal sessions.

---

## 📂 Project Structure

This project is set up as an elegant **NPM Monorepo Workspace**:

```
vault/
├── package.json                   # Monorepo workspaces and scripts
├── .gitignore                     # Git ignore rules for node_modules, .env, and builds
├── backend/                       # Express + Mongoose API
│   ├── src/
│   │   ├── index.js               # Express Server & CORS config
│   │   ├── models/                # User & Project schemas
│   │   ├── services/              # Pure business logic & AES encryption
│   │   ├── controllers/           # HTTP Request Handlers
│   │   ├── routes/                # Endpoint routing
│   │   └── utils/
│   │       └── crypto.js          # AES-256-GCM core helper
├── frontend/                      # React + Vite + Tailwind Web Client
│   ├── vite.config.js             # Dev Server (port 5173) and Plugins
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Protected Route & Route configuration
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Token state & auto-refresh Axios interceptors
│   │   └── pages/
│   │       ├── Login.jsx          # Glassmorphic Login
│   │       ├── Signup.jsx         # Glassmorphic Signup
│   │       ├── Dashboard.jsx      # Vault workspace overview & 3-step CLI guides
│   │       └── ProjectDetail.jsx  # Structured Tables, Raw editor, & Sync guide
└── cli/                           # Companion Node.js CLI Tool
    ├── index.js                   # env-vault command processor
    └── package.json               # Binary configuration & NPM link command
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com/) running locally or an active MongoDB Atlas cluster.

### 2. Installation
Clone the repository and install all workspace dependencies concurrently from the root:
```bash
npm install
```

### 3. Server Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/envvault
JWT_SECRET=your_super_secret_jwt_key
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### 4. Running the Dev Suites Concurrently
Execute the master monorepo command at the root to launch both the frontend (Vite) and backend (Express) concurrently:
```bash
npm run dev
```
*   **Web Frontend**: `http://localhost:5173`
*   **REST API Backend**: `http://localhost:5000`

---

## 💻 CLI Companion Usage

Install and link the CLI globally on your system:
```bash
# Link the CLI workspace binary globally
cd cli && npm link
```

Now, the `env-vault` command is available everywhere on your machine!

### Core Commands:

#### 1. Authenticate Terminal
```bash
env-vault login
```

#### 2. Link Workspace Directory (Once)
Navigate to your local project directory and link it securely to your vault project:
```bash
env-vault init <project-id>
```

#### 3. Daily Push and Pull (No IDs required!)
```bash
# Pull vault secrets securely to your local .env
env-vault pull development

# Push local .env changes to production
env-vault push production
```

#### 4. List Active Vaults
```bash
env-vault list
```

#### 5. End Terminal Session
```bash
env-vault logout
```

---

## 🚀 Production Cloud Deployment

### 💻 1. Express Backend ➡️ Render
1. Go to [Render](https://render.com) and create a **Web Service** linked to your repo.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Configure Environment Variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`.

### ⚡ 2. Vite Frontend ➡️ Vercel
1. Go to [Vercel](https://vercel.com) and import your repository.
2. Set **Root Directory** to `frontend`.
3. Set Framework Preset to **Vite**.
4. Configure Environment Variables:
   * `VITE_API_URL`: Set to your Render backend URL (e.g. `https://env-vault-api.onrender.com/api`).

---

## 📄 License
This project is licensed under the MIT License.

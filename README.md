# 🌿 Env-Vault

> **The Ultimate Full-Stack Secure Secret & Environment Manager** with a premium dark-glassmorphic UI, a self-healing companion CLI, and AES-256-GCM authenticated encryption.

---

## ✨ Features

*   **🔒 AES-256-GCM Cryptographic Storage**: Secrets are dynamically encrypted on the fly with unique 96-bit random Initialization Vectors (`iv`) and cryptographic verification authentication tags. Raw secrets never touch the database.
*   **💻 Self-Healing Companion CLI**: High-speed full `.env` pushes and pulls. Integrated with a **silent token refresh interceptor** that automatically resolves expired access sessions.
*   **🎨 Premium Glassmorphic Web UI**: A beautiful user interface styled with custom Google Typography (`Outfit` & `Plus Jakarta Sans`) and a sleek Lush Forest color scheme.
*   **🔗 Git-like Workspace Linking**: Use `env-vault init <projectId>` inside a local directory to link it permanently. Daily pulls and pushes require **no project IDs**!
*   **🔑 Dual-Token Authentication**: Secure authentication using Access Tokens and Refresh Tokens that automatically sync across web cookies and terminal sessions.

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
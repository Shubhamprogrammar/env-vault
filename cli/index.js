#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const inquirer = require('inquirer');
const chalk = require('chalk');
const os = require('os');

const program = new Command();

const CONFIG_PATH = path.join(os.homedir(), '.env-vault-config.json');
const DEFAULT_API_URL = 'http://localhost:5000/api';

// Utility functions for loading/saving config
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      // Ignore parse errors
    }
  }
  return { apiUrl: DEFAULT_API_URL, token: null, refreshToken: null };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

const config = loadConfig();

// Axios instance with config headers
const api = axios.create({
  baseURL: config.apiUrl,
});

if (config.token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
}

// Add Axios response interceptor for automatic token refresh in CLI
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && config.refreshToken) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken: config.refreshToken,
        });
        const newAccessToken = res.data.accessToken;
        config.token = newAccessToken;
        saveConfig(config);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        config.token = null;
        config.refreshToken = null;
        saveConfig(config);
        console.log(chalk.red('\n❌ Session expired. Please log in again using `env-vault login`.'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Global error handler for axios
function handleAxiosError(err) {
  if (err.response) {
    console.error(chalk.red(`❌ Error: ${err.response.data.message || err.response.statusText}`));
  } else if (err.request) {
    console.error(chalk.red('❌ Error: Could not connect to the server. Make sure the backend is running.'));
  } else {
    console.error(chalk.red(`❌ Error: ${err.message}`));
  }
}

program
  .name('env-vault')
  .description('CLI to sync environment variables securely with Env-Vault')
  .version('0.1.0');

// Login command
program
  .command('login')
  .description('Sign in to your Env-Vault account')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Enter email:',
          validate: (val) => val ? true : 'Email is required',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter password:',
          mask: '*',
          validate: (val) => val ? true : 'Password is required',
        },
      ]);

      console.log(chalk.yellow('Signing in...'));
      const res = await api.post('/auth/signin', {
        email: answers.email,
        password: answers.password,
      });

      const { accessToken, refreshToken } = res.data;
      config.token = accessToken;
      config.refreshToken = refreshToken;
      saveConfig(config);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      console.log(chalk.green('✅ Successfully logged in! Session token saved.'));
    } catch (err) {
      handleAxiosError(err);
    }
  });

// Logout command
program
  .command('logout')
  .description('Log out of Env-Vault and remove session token')
  .action(() => {
    config.token = null;
    config.refreshToken = null;
    saveConfig(config);
    delete api.defaults.headers.common['Authorization'];
    console.log(chalk.green('✅ Logged out successfully. Session tokens deleted.'));
  });

// List command
program
  .command('list')
  .description('List all projects in your vault')
  .action(async () => {
    if (!config.token) {
      console.log(chalk.red('❌ You must login first using `env-vault login`.'));
      return;
    }
    try {
      console.log(chalk.yellow('Fetching projects...'));
      const res = await api.get('/project');
      const projects = res.data;

      if (projects.length === 0) {
        console.log(chalk.blue('No projects found. Create one in the web UI.'));
        return;
      }

      console.log('\n' + chalk.bold.underline('📂 Your Projects:'));
      projects.forEach((proj, idx) => {
        console.log(`${idx + 1}. ${chalk.bold.green(proj.name)} ${chalk.dim(`(ID: ${proj._id})`)}`);
        if (proj.description) {
          console.log(`   ${chalk.italic.gray(proj.description)}`);
        }
        console.log(`   ${chalk.cyan('Environments:')} ${proj.environments.length > 0 ? proj.environments.map(e => e.name).join(', ') : 'None'}\n`);
      });
    } catch (err) {
      handleAxiosError(err);
    }
  });

// Init command
program
  .command('init <projectId>')
  .description('Link this local directory to a secure Env-Vault project ID')
  .action((projectId) => {
    const localConfigPath = path.resolve(process.cwd(), '.env-vault.json');
    fs.writeFileSync(localConfigPath, JSON.stringify({ projectId }, null, 2), 'utf8');

    // Automatically add it to .gitignore if it exists
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      let content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes('.env-vault.json')) {
        const separator = content.endsWith('\n') ? '' : '\n';
        fs.appendFileSync(gitignorePath, `${separator}.env-vault.json\n`, 'utf8');
        console.log(chalk.gray('📝 Added .env-vault.json to .gitignore'));
      }
    }

    console.log(chalk.green(`\n✅ Initialized secure workspace with Project ID: ${chalk.bold(projectId)}`));
    console.log(chalk.gray(`   Daily push/pull commands can now omit the Project ID! (e.g. \`env-vault pull development\`)` + '\n'));
  });

// Push command
program
  .command('push [projectIdOrEnvName] [envName]')
  .description('Push local .env file fully to the secure vault')
  .action(async (projectIdOrEnvName, envName) => {
    if (!config.token) {
      console.log(chalk.red('❌ You must login first using `env-vault login`.'));
      return;
    }

    let projectId = projectIdOrEnvName;
    let env = envName;

    // Handle optional projectId when local configuration is set
    if (!envName) {
      env = projectIdOrEnvName;
      const localConfigPath = path.resolve(process.cwd(), '.env-vault.json');
      if (fs.existsSync(localConfigPath)) {
        try {
          const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
          projectId = localConfig.projectId;
        } catch (e) {
          // ignore parsing issues
        }
      }

      if (!projectId || !env) {
        console.log(chalk.red('❌ Error: No project initialized in this directory.'));
        console.log(chalk.gray('👉 Link it first using: `env-vault init <projectId>`'));
        console.log(chalk.gray('👉 Or run explicitly:  `env-vault push <projectId> <envName>`'));
        return;
      }
    }

    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.error(chalk.red('❌ Error: No local .env file found in this directory.'));
      return;
    }

    try {
      console.log(chalk.yellow('Parsing local .env file...'));
      const envBuffer = fs.readFileSync(envPath);
      const parsedEnv = dotenv.parse(envBuffer);

      console.log(chalk.yellow(`Pushing environment variables for ${chalk.bold(env)} to project ${chalk.bold(projectId)}...`));

      const res = await api.post(`/env/${projectId}/envs/${env}/push`, {
        variables: parsedEnv,
      });

      console.log(chalk.green(`✅ ${res.data.message || 'Environment successfully updated in the vault!'}`));
    } catch (err) {
      handleAxiosError(err);
    }
  });

// Pull command
program
  .command('pull [projectIdOrEnvName] [envName]')
  .description('Pull variables for an environment fully from the vault to local .env')
  .action(async (projectIdOrEnvName, envName) => {
    if (!config.token) {
      console.log(chalk.red('❌ You must login first using `env-vault login`.'));
      return;
    }

    let projectId = projectIdOrEnvName;
    let env = envName;

    // Handle optional projectId when local configuration is set
    if (!envName) {
      env = projectIdOrEnvName;
      const localConfigPath = path.resolve(process.cwd(), '.env-vault.json');
      if (fs.existsSync(localConfigPath)) {
        try {
          const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
          projectId = localConfig.projectId;
        } catch (e) {
          // ignore parsing issues
        }
      }

      if (!projectId || !env) {
        console.log(chalk.red('❌ Error: No project initialized in this directory.'));
        console.log(chalk.gray('👉 Link it first using: `env-vault init <projectId>`'));
        console.log(chalk.gray('👉 Or run explicitly:  `env-vault pull <projectId> <envName>`'));
        return;
      }
    }

    try {
      console.log(chalk.yellow(`Pulling environment variables for ${chalk.bold(env)} from project ${chalk.bold(projectId)}...`));
      const res = await api.get(`/env/${projectId}/envs/${env}/pull`);

      const variables = res.data.variables || {};

      // Convert map to .env string format
      let envContent = '';
      for (const [key, value] of Object.entries(variables)) {
        envContent += `${key}=${value}\n`;
      }

      const envPath = path.resolve(process.cwd(), '.env');
      fs.writeFileSync(envPath, envContent, 'utf8');

      console.log(chalk.green(`✅ Successfully pulled environment to local .env file!`));
    } catch (err) {
      handleAxiosError(err);
    }
  });

program.parse(process.argv);

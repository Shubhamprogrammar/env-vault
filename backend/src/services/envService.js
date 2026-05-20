const Project = require('../models/Project');
const { encryptValue, decryptValue } = require('../utils/crypto');

async function verifyAndGetProject(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');
  if (project.owner.toString() !== userId) throw new Error('Not authorized');
  return project;
}

async function getEnvironmentsList(projectId, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  return project.environments.map(e => e.name);
}

async function getDecryptedVariables(projectId, envName, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  const env = project.environments.find(e => e.name === envName);
  if (!env) return [];
  return env.variables.map(v => ({
    key: v.key,
    value: decryptValue(v.encryptedValue, v.iv, v.authTag)
  }));
}

async function saveVariable(projectId, envName, key, value, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  let env = project.environments.find(e => e.name === envName);
  if (!env) {
    env = { name: envName, variables: [] };
    project.environments.push(env);
  }
  const { encrypted, iv, tag } = encryptValue(value);
  const existing = env.variables.find(v => v.key === key);
  if (existing) {
    existing.encryptedValue = encrypted;
    existing.iv = iv;
    existing.authTag = tag;
    existing.updatedAt = new Date();
  } else {
    env.variables.push({ key, encryptedValue: encrypted, iv, authTag: tag });
  }
  await project.save();
  return { message: 'Variable saved' };
}

async function deleteVariable(projectId, envName, key, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  const env = project.environments.find(e => e.name === envName);
  if (!env) throw new Error('Environment not found');
  env.variables = env.variables.filter(v => v.key !== key);
  await project.save();
  return { message: 'Variable deleted' };
}

async function pushFullEnvironment(projectId, envName, variablesMap, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  let env = project.environments.find(e => e.name === envName);
  if (!env) {
    if (Object.keys(variablesMap).length === 0) {
      throw new Error('Cannot push an empty environment. Add variables to .env before pushing.');
    }
    env = { name: envName, variables: [] };
    project.environments.push(env);
  }
  // Clear existing variables for this env
  env.variables = [];
  // Encrypt and add all new variables
  for (const [key, value] of Object.entries(variablesMap)) {
    const { encrypted, iv, tag } = encryptValue(value);
    env.variables.push({ key, encryptedValue: encrypted, iv, authTag: tag });
  }
  await project.save();
  return { message: 'Environment updated' };
}

async function pullFullEnvironment(projectId, envName, userId) {
  const project = await verifyAndGetProject(projectId, userId);
  const env = project.environments.find(e => e.name === envName);
  if (!env) return {};
  const variablesMap = {};
  env.variables.forEach(v => {
    variablesMap[v.key] = decryptValue(v.encryptedValue, v.iv, v.authTag);
  });
  return variablesMap;
}

module.exports = {
  getEnvironmentsList,
  getDecryptedVariables,
  saveVariable,
  deleteVariable,
  pushFullEnvironment,
  pullFullEnvironment,
};

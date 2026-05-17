const envService = require('../services/envService');

async function getEnvironments(req, res) {
  try {
    const envs = await envService.getEnvironmentsList(req.params.projectId, req.user.id);
    res.json({ environments: envs });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function getVariables(req, res) {
  try {
    const variables = await envService.getDecryptedVariables(req.params.projectId, req.params.envName, req.user.id);
    res.json({ variables });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function saveVar(req, res) {
  const { key, value } = req.body;
  if (!key || typeof value === 'undefined') {
    return res.status(400).json({ message: 'key and value required' });
  }
  try {
    const result = await envService.saveVariable(req.params.projectId, req.params.envName, key, value, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function deleteVar(req, res) {
  try {
    const result = await envService.deleteVariable(req.params.projectId, req.params.envName, req.params.key, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function pushEnv(req, res) {
  const { variables } = req.body;
  if (!variables || typeof variables !== 'object') {
    return res.status(400).json({ message: 'variables map is required in request body' });
  }
  try {
    const result = await envService.pushFullEnvironment(req.params.projectId, req.params.envName, variables, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function pullEnv(req, res) {
  try {
    const variables = await envService.pullFullEnvironment(req.params.projectId, req.params.envName, req.user.id);
    res.json({ variables });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  getEnvironments,
  getVariables,
  saveVar,
  deleteVar,
  pushEnv,
  pullEnv,
};

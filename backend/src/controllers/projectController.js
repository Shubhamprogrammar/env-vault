const projectService = require('../services/projectService');

async function createProject(req, res) {
  const { name, description } = req.body;
  try {
    const project = await projectService.createProject({
      name,
      description,
      ownerId: req.user.id,
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await projectService.getProjectsByOwner(req.user.id);
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function getProject(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProject,
};

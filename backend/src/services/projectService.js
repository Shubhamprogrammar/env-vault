const Project = require('../models/Project');

async function createProject({ name, description, ownerId }) {
  const project = new Project({
    name,
    description,
    owner: ownerId,
  });
  await project.save();
  return project;
}

async function getProjectsByOwner(ownerId) {
  return await Project.find({ owner: ownerId });
}

async function getProjectById(projectId, ownerId) {
  return await Project.findOne({ _id: projectId, owner: ownerId });
}

module.exports = {
  createProject,
  getProjectsByOwner,
  getProjectById,
};

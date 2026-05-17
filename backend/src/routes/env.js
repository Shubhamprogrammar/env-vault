const express = require('express');
const envController = require('../controllers/envController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/:projectId/envs', envController.getEnvironments);
router.get('/:projectId/envs/:envName', envController.getVariables);
router.post('/:projectId/envs/:envName/var', envController.saveVar);
router.delete('/:projectId/envs/:envName/var/:key', envController.deleteVar);

router.post('/:projectId/envs/:envName/push', envController.pushEnv);
router.get('/:projectId/envs/:envName/pull', envController.pullEnv);

module.exports = router;

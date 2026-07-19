const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.get('/', agentController.getAgents);
router.post('/', agentController.createAgent);
router.put('/:id', agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

module.exports = router;

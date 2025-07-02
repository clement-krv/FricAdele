const express = require('express');
const router = express.Router();

// Route de test simple
router.get('/health-simple', (req, res) => {
    res.json({
        success: true,
        message: 'Neo4j routes working',
        timestamp: new Date().toISOString()
    });
});

// Route de health check Neo4j réelle (version test)
router.get('/health', async (req, res) => {
    try {
        const Neo4jService = require('../services/neo4jService');
        const neo4jService = new Neo4jService();
        const isConnected = await neo4jService.connect();
        
        res.json({
            success: true,
            neo4jConnected: isConnected,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            neo4jConnected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateDevice, authorizeRole } = require('../../middleware/auth.middleware');
const { BlockchainService } = require('../../services/blockchain.service');
const { AIService } = require('../../services/ai.service');

router.post('/submit', 
  authenticateDevice,
  authorizeRole(['scanner', 'validator']),
  async (req, res) => {
    try {
      const { spectralData, batchMetadata } = req.body;
      
      // AI Anomaly Detection
      const anomalyScore = await AIService.detectAnomaly(spectralData);
      if (anomalyScore > process.env.ANOMALY_THRESHOLD) {
        return res.status(400).json({
          error: 'Spectral anomaly detected',
          score: anomalyScore
        });
      }

      // Blockchain Submission
      const result = await BlockchainService.submitScan({
        deviceId: req.device.id,
        spectralData,
        metadata: batchMetadata
      });

      res.json({
        status: 'Scan recorded',
        txHash: result.txHash,
        blockNumber: result.blockNumber
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
const { createGateway } = require('../config/blockchain.config');

class BlockchainService {
  async submitScan(scanData) {
    const gateway = await createGateway();
    const network = await gateway.getNetwork('pharmachannel');
    const contract = network.getContract('pharma');
    
    try {
      await contract.submitTransaction(
        'RegisterBatch',
        scanData.batchId,
        scanData.spectralHash,
        JSON.stringify(scanData.metadata)
      );
      
      return { status: 'Blockchain commit successful' };
    } finally {
      gateway.disconnect();
    }
  }

  async verifyBatch(batchId) {
    const gateway = await createGateway();
    const network = await gateway.getNetwork('pharmachannel');
    const contract = network.getContract('pharma');
    
    try {
      const result = await contract.evaluateTransaction(
        'VerifyBatch',
        batchId
      );
      
      return JSON.parse(result.toString());
    } finally {
      gateway.disconnect();
    }
  }
}

module.exports = BlockchainService;
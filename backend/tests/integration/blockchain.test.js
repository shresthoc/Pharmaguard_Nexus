const { expect } = require('chai');
const { BlockchainService } = require('../../src/services/blockchain.service');
const { v4: uuidv4 } = require('uuid');

describe('Blockchain Integration', () => {
  const service = new BlockchainService();
  const testBatch = {
    batchId: uuidv4(),
    spectralHash: 'a3f4d5...',
    metadata: { drug: 'Paracetamol', dosage: '500mg' }
  };

  it('should submit batch to blockchain', async () => {
    const result = await service.submitScan(testBatch);
    expect(result).to.have.property('status', 'Blockchain commit successful');
  });

  it('should verify batch existence', async () => {
    const verification = await service.verifyBatch(testBatch.batchId);
    expect(verification).to.have.nested.property('batch.id', testBatch.batchId);
    expect(verification.provenance).to.have.lengthOf(1);
  });

  it('should reject invalid batches', async () => {
    try {
      await service.verifyBatch('invalid_id');
      throw new Error('Test should fail');
    } catch (err) {
      expect(err.message).to.include('Batch not found');
    }
  });
});
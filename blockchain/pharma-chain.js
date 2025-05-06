const { Wallets, Gateway } = require('fabric-network');
const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class PharmaChain extends Contract {

  async InitLedger(ctx) {
    const manufacturers = [
      { id: 'MFR1', name: 'PharmaCorp', publicKey: process.env.REGULATOR_PUBKEY },
      { id: 'MFR2', name: 'MediHealth', publicKey: process.env.REGULATOR_PUBKEY }
    ];
    
    for (const mfr of manufacturers) {
      await ctx.stub.putState(mfr.id, Buffer.from(JSON.stringify(mfr)));
    }
  }

  async RegisterBatch(ctx, batchId, spectralHash, metadata) {
    const mspId = ctx.clientIdentity.getMSPID();
    const existing = await ctx.stub.getState(batchId);
    
    if (existing && existing.length > 0) {
      throw new Error(`Batch ${batchId} already exists`);
    }

    const batch = {
      id: batchId,
      spectralHash,
      metadata: JSON.parse(metadata),
      owner: mspId,
      timestamp: ctx.stub.getTxTimestamp(),
      txId: ctx.stub.getTxID()
    };

    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
    return JSON.stringify(batch);
  }

  async VerifyBatch(ctx, batchId) {
    const batchBytes = await ctx.stub.getState(batchId);
    if (!batchBytes || batchBytes.length === 0) {
      throw new Error(`Batch ${batchId} does not exist`);
    }
    
    const batch = JSON.parse(batchBytes.toString());
    const history = await ctx.stub.getHistoryForKey(batchId);
    const provenance = [];
    
    for await (const keyMod of history) {
      provenance.push({
        txId: keyMod.txId,
        value: JSON.parse(keyMod.value.toString('utf8')),
        timestamp: keyMod.timestamp
      });
    }

    return JSON.stringify({
      batch,
      provenance,
      valid: provenance.length === 1 && 
             provenance[0].txId === batch.txId
    });
  }
}

module.exports = PharmaChain;
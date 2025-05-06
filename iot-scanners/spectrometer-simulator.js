const crypto = require('crypto');
const { IoTDataClient } = require('@aws-sdk/client-iot-data-plane');
const { v4: uuidv4 } = require('uuid');

class SpectrometerSimulator {
  constructor(deviceId) {
    this.deviceId = deviceId;
    this.iotClient = new IoTDataClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });
    this.calibrationCache = new Map();
  }

  async #publishToBlockchain(scanData) {
    const params = {
      topic: `pharma/scans/${this.deviceId}`,
      payload: JSON.stringify({
        ...scanData,
        digitalSignature: this.#signData(scanData)
      }),
      qos: 1
    };
    
    await this.iotClient.publish(params);
  }

  #signData(data) {
    const hmac = crypto.createHmac('sha3-256', process.env.DEVICE_SECRET);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  async performScan(batchDetails) {
    const spectralData = this.#generateSpectralSignature(batchDetails);
    const scanPayload = {
      scanId: uuidv4(),
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId,
      geoLocation: process.env.DEVICE_LOCATION,
      spectralData,
      batchMetadata: batchDetails
    };

    await this.#publishToBlockchain(scanPayload);
    return scanPayload;
  }

  #generateSpectralSignature({ activeCompound, purity }) {
    const baseFrequency = activeCompound.charCodeAt(0) * 0.8;
    return Array.from({ length: 200 }, (_, i) => {
      const noise = Math.random() * 0.02 * (100 - purity);
      return Math.sin(baseFrequency * i * 0.1) * purity + noise;
    });
  }
}

module.exports = SpectrometerSimulator;
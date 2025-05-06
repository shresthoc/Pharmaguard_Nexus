const { IoT } = require('@aws-sdk/client-iot');
const { createPrivateKey, createSign } = require('crypto');

class DeviceManager {
  #iotClient;

  constructor() {
    this.#iotClient = new IoT({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });
  }

  async registerDevice(deviceParams) {
    const { deviceId, csr } = deviceParams;
    const certificate = await this.#iotClient.createKeysAndCertificate({
      setAsActive: true
    });
    
    await this.#iotClient.attachThingPrincipal({
      thingName: deviceId,
      principal: certificate.certificateArn
    });

    return {
      certificatePem: certificate.certificatePem,
      keyPair: {
        publicKey: certificate.keyPair.PublicKey,
        privateKey: certificate.keyPair.PrivateKey
      }
    };
  }

  async revokeDevice(deviceId) {
    const certs = await this.#iotClient.listThingPrincipals({ thingName: deviceId });
    await Promise.all(certs.principals.map(arn => 
      this.#iotClient.updateCertificate({
        certificateId: arn.split('/').pop(),
        newStatus: 'REVOKED'
      })
    ));
  }

  verifyDeviceSignature(signature, publicKey, data) {
    const verifier = createVerify('sha256');
    verifier.update(data);
    return verifier.verify(publicKey, signature, 'hex');
  }
}

module.exports = DeviceManager;
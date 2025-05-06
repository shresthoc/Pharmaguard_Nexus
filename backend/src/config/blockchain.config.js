const { Gateway, Wallets } = require('fabric-network');
const path = require('path');

const blockchainConfig = {
  walletPath: path.join(process.cwd(), 'wallet'),
  identity: 'admin',
  channel: 'pharmachannel',
  chaincode: 'pharma',
  connectionProfile: {
    name: 'PharmaNet',
    version: '1.0.0',
    client: {
      organization: 'ManufacturerOrg',
      connection: {
        timeout: {
          peer: {
            endorser: '300'
          }
        }
      }
    },
    organizations: {
      ManufacturerOrg: {
        mspid: 'ManufacturerMSP',
        peers: ['peer0.manufacturer.pharma.com']
      }
    },
    peers: {
      'peer0.manufacturer.pharma.com': {
        url: 'grpc://localhost:7051',
        tlsCACerts: {
          path: path.resolve(__dirname, '../../crypto/peers/peer0/msp/tlscacerts/tls-cert.pem')
        }
      }
    }
  }
};

async function createGateway() {
  const wallet = await Wallets.newFileSystemWallet(blockchainConfig.walletPath);
  const gateway = new Gateway();
  await gateway.connect(blockchainConfig.connectionProfile, {
    wallet,
    identity: blockchainConfig.identity,
    discovery: { enabled: true, asLocalhost: true }
  });
  return gateway;
}

module.exports = { blockchainConfig, createGateway };
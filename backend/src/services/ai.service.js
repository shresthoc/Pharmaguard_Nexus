const tf = require('@tensorflow/tfjs-node');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.resolve(__dirname, '../../protos/anomaly.proto');

class AIService {
  static async detectAnomaly(spectralData) {
    // TensorFlow Model Prediction
    const model = await tf.loadGraphModel(process.env.MODEL_URL);
    const tensor = tf.tensor2d([spectralData]);
    const prediction = model.predict(tensor);
    const score = prediction.dataSync()[0];
    
    // gRPC Validation
    const packageDefinition = protoLoader.loadSync(PROTO_PATH);
    const anomalyProto = grpc.loadPackageDefinition(packageDefinition).anomaly;
    const client = new anomalyProto.AnomalyService(
      process.env.AI_SERVICE_ENDPOINT,
      grpc.credentials.createInsecure()
    );
    
    return new Promise((resolve, reject) => {
      client.DetectAnomaly({ spectral_data: spectralData }, (err, response) => {
        if (err) reject(err);
        resolve((score + response.score) / 2);
      });
    });
  }
}

module.exports = { AIService };
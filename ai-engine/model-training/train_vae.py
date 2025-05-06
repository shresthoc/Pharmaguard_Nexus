import argparse
import tensorflow as tf
from spectral_vae import SpectralVAE
from spectral_loader import SpectralDataLoader

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--latent-dim', type=int, default=32)
    parser.add_argument('--epochs', type=int, default=200)
    parser.add_argument('--batch-size', type=int, default=256)
    parser.add_argument('--learning-rate', type=float, default=1e-4)
    parser.add_argument('--kafka-servers', type=str, required=True)
    parser.add_argument('--kafka-topic', type=str, required=True)
    args = parser.parse_args()

    # Initialize components
    data_loader = SpectralDataLoader(args.kafka_servers, args.kafka_topic)
    dataset = data_loader.create_tf_dataset()
    vae = SpectralVAE(latent_dim=args.latent_dim)
    optimizer = tf.keras.optimizers.Adam(args.learning_rate)
    
    # Training loop
    @tf.function
    def train_step(batch):
        with tf.GradientTape() as tape:
            loss = vae.compute_loss(batch)
        gradients = tape.gradient(loss, vae.trainable_variables)
        optimizer.apply_gradients(zip(gradients, vae.trainable_variables))
        return loss

    for epoch in range(args.epochs):
        epoch_loss = []
        for batch in dataset:
            loss = train_step(batch)
            epoch_loss.append(loss.numpy())
        
        print(f'Epoch {epoch+1} | Loss: {np.mean(epoch_loss):.4f}')
    
    # Save final model
    vae.save_weights(f'spectral_vae_{args.latent_dim}d.h5')

if __name__ == "__main__":
    main()
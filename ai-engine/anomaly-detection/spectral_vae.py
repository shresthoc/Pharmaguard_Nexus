import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Lambda
from tensorflow.keras.models import Model
from tensorflow.keras.losses import mse
from tensorflow.keras import backend as K

class SpectralVAE:
    def __init__(self, original_dim=200, latent_dim=32):
        self.original_dim = original_dim
        self.latent_dim = latent_dim
        self.encoder = self.build_encoder()
        self.decoder = self.build_decoder()
        self.vae = self.build_vae()

    def build_encoder(self):
        inputs = Input(shape=(self.original_dim,))
        x = Dense(128, activation='selu')(inputs)
        x = Dense(64, activation='selu')(x)
        z_mean = Dense(self.latent_dim)(x)
        z_log_var = Dense(self.latent_dim)(x)
        
        def sampling(args):
            z_mean, z_log_var = args
            epsilon = K.random_normal(shape=(K.shape(z_mean)[0], self.latent_dim))
            return z_mean + K.exp(0.5 * z_log_var) * epsilon
            
        z = Lambda(sampling)([z_mean, z_log_var])
        return Model(inputs, [z_mean, z_log_var, z], name='encoder')

    def build_decoder(self):
        latent_inputs = Input(shape=(self.latent_dim,))
        x = Dense(64, activation='selu')(latent_inputs)
        x = Dense(128, activation='selu')(x)
        outputs = Dense(self.original_dim, activation='sigmoid')(x)
        return Model(latent_inputs, outputs, name='decoder')

    def build_vae(self):
        inputs = Input(shape=(self.original_dim,))
        z_mean, z_log_var, z = self.encoder(inputs)
        outputs = self.decoder(z)
        
        reconstruction_loss = mse(inputs, outputs) * self.original_dim
        kl_loss = 1 + z_log_var - K.square(z_mean) - K.exp(z_log_var)
        kl_loss = K.sum(kl_loss, axis=-1) * -0.5
        
        vae_loss = K.mean(reconstruction_loss + kl_loss)
        vae = Model(inputs, outputs)
        vae.add_loss(vae_loss)
        vae.compile(optimizer='nadam')
        return vae

    def detect_anomaly(self, spectral_data):
        z_mean, _, _ = self.encoder.predict(spectral_data)
        reconstructed = self.decoder.predict(z_mean)
        return tf.reduce_mean(tf.square(spectral_data - reconstructed), axis=1).numpy()
from kafka import KafkaConsumer
import numpy as np
import tensorflow as tf

class SpectralStream:
    def __init__(self, bootstrap_servers, topic):
        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers=bootstrap_servers,
            value_deserializer=lambda x: np.frombuffer(x, dtype=np.float32),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )
        self.window_size = 60
        self.batch_size = 32

    def stream_generator(self):
        window = []
        for message in self.consumer:
            spectral = message.value
            window.append(spectral)
            
            if len(window) >= self.window_size:
                batch = np.array(window[-self.window_size:])
                window = []
                yield batch

    def tf_data_generator(self):
        return tf.data.Dataset.from_generator(
            self.stream_generator,
            output_signature=tf.TensorSpec(
                shape=(self.window_size, 200),
                dtype=tf.float32
            )
        ).batch(self.batch_size).prefetch(tf.data.AUTOTUNE)
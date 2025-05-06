import numpy as np
from scipy.signal import savgol_filter

class SpectralGenerator:
    def __init__(self, noise_level=0.05):
        self.base_spectra = {
            'paracetamol': self._create_base(0.8, 3),
            'ibuprofen': self._create_base(1.2, 5),
            'aspirin': self._create_base(1.0, 4)
        }
        self.noise_level = noise_level

    def _create_base(self, amplitude, peaks):
        x = np.linspace(0, 10, 200)
        signal = amplitude * np.sin(2 * np.pi * x)
        for _ in range(peaks):
            pos = np.random.randint(20, 180)
            signal += np.exp(-(x - x[pos])**2 / 0.1)
        return savgol_filter(signal, 11, 3)

    def generate_sample(self, compound, purity):
        base = self.base_spectra[compound]
        noise = self.noise_level * (100 - purity) * np.random.normal(size=200)
        
        # Simulate common defects
        if np.random.rand() < 0.15:  # 15% defect rate
            defect_type = np.random.choice(['shift', 'noise', 'baseline'])
            if defect_type == 'shift':
                base = np.roll(base, np.random.randint(-10, 10))
            elif defect_type == 'noise':
                noise *= 3
            elif defect_type == 'baseline':
                base += 0.5 * np.linspace(0, 1, 200)
        
        return np.clip(base + noise, 0, 1)

    def generate_dataset(self, samples_per_class=1000):
        X = []
        y = []
        for compound in self.base_spectra.keys():
            for _ in range(samples_per_class):
                purity = np.random.uniform(85, 100)
                X.append(self.generate_sample(compound, purity))
                y.append(compound)
        return np.array(X), np.array(y)
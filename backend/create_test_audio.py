import numpy as np
import soundfile as sf

# Generate a more complex waveform to simulate speech-like audio
duration = 3  # seconds
sample_rate = 44100
t = np.linspace(0, duration, int(sample_rate * duration))

# Create a mix of frequencies typical in human speech (100-300 Hz fundamental)
frequencies = [100, 200, 300]
audio_data = np.zeros_like(t)

for freq in frequencies:
    audio_data += 0.2 * np.sin(2 * np.pi * freq * t)

# Add some amplitude modulation to simulate speech patterns
modulation = 2 + np.sin(2 * np.pi * 2 * t)  # 2 Hz modulation
audio_data = audio_data * modulation

# Normalize to prevent clipping
audio_data = 0.5 * audio_data / np.max(np.abs(audio_data))

# Save as WAV file
sf.write('test_audio.wav', audio_data, sample_rate)

print("Created test_audio.wav file with simulated speech-like audio") 
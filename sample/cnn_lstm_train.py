import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
import variables as v
from features import freq_band_features

# TensorFlow/Keras
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (Conv1D, MaxPooling1D, LSTM, Dense,
                                     Dropout, BatchNormalization, Reshape)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

freq_bands = joblib.load('freq_bands.pkl')
SFREQ = v.SFREQ

def load_all_data():
    X_all, y_all = [], []
    data_dir = v.DIR_FILTERED
    for task, label in [('Arithmetic', 1), ('Stroop', 1), ('Mirror_image', 1), ('Relax', 0)]:
        files = [f for f in os.listdir(data_dir) if f.startswith(task)]
        for fname in sorted(files):
            path    = os.path.join(data_dir, fname)
            mat     = sio.loadmat(path)
            data    = mat['Clean_data']
            n_ch, n_samp = data.shape
            n_secs  = n_samp // SFREQ
            epoched = data[:, :n_secs*SFREQ].reshape(1, n_secs, n_ch, SFREQ)
            feats   = freq_band_features(epoched, freq_bands)
            X_all.append(feats)
            y_all.extend([label] * n_secs)
    return np.vstack(X_all), np.array(y_all)

print("Loading data...")
X, y = load_all_data()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler     = MinMaxScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

# Reshape for CNN-LSTM: (samples, timesteps, features)
# Treat 160 features as 32 timesteps × 5 features (32 channels × 5 bands)
X_train_3d = X_train_sc.reshape(-1, 32, 5)
X_test_3d  = X_test_sc.reshape(-1, 32, 5)

print("Building CNN-LSTM model...")
model = Sequential([
    Conv1D(64, kernel_size=3, activation='relu', padding='same', input_shape=(32, 5)),
    BatchNormalization(),
    Conv1D(128, kernel_size=3, activation='relu', padding='same'),
    BatchNormalization(),
    MaxPooling1D(pool_size=2),
    Dropout(0.3),
    LSTM(64, return_sequences=True),
    LSTM(32),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.summary()

callbacks = [
    EarlyStopping(patience=10, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(patience=5, factor=0.5, verbose=1)
]

print("Training CNN-LSTM...")
model.fit(X_train_3d, y_train, epochs=100, batch_size=32,
          validation_split=0.1, callbacks=callbacks, verbose=1)

y_pred_proba = model.predict(X_test_3d).flatten()
y_pred       = (y_pred_proba >= 0.5).astype(int)
accuracy     = round(metrics.accuracy_score(y_test, y_pred) * 100, 1)
print(metrics.classification_report(y_test, y_pred))
print(f"CNN-LSTM Accuracy: {accuracy}%")

model.save('cnn_lstm_model.keras')
joblib.dump(scaler,   'cnn_lstm_scaler.pkl')
joblib.dump(accuracy, 'cnn_lstm_accuracy.pkl')
print("CNN-LSTM saved.")
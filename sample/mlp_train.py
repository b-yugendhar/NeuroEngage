import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
import variables as v
from features import freq_band_features

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

mlp_scaler = MinMaxScaler()
X_train_sc = mlp_scaler.fit_transform(X_train)
X_test_sc  = mlp_scaler.transform(X_test)

print("Training MLP...")
mlp = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64),
    activation='relu',
    solver='adam',
    learning_rate_init=0.001,
    max_iter=300,
    early_stopping=True,
    validation_fraction=0.1,
    random_state=42,
    verbose=True
)
mlp.fit(X_train_sc, y_train)

y_pred   = mlp.predict(X_test_sc)
accuracy = round(metrics.accuracy_score(y_test, y_pred) * 100, 1)
print(metrics.classification_report(y_test, y_pred))
print(f"MLP Accuracy: {accuracy}%")

joblib.dump(mlp,        'mlp_model.pkl')
joblib.dump(mlp_scaler, 'mlp_scaler.pkl')
joblib.dump(accuracy,   'mlp_accuracy.pkl')
print("MLP saved.")
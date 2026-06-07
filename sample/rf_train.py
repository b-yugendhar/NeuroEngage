import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.ensemble import RandomForestClassifier
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
            path  = os.path.join(data_dir, fname)
            mat   = sio.loadmat(path)
            data  = mat['Clean_data']
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

rf_scaler  = MinMaxScaler()
X_train_rf = rf_scaler.fit_transform(X_train)
X_test_rf  = rf_scaler.transform(X_test)

print("Training Random Forest...")
rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train_rf, y_train)

rf_pred = rf.predict(X_test_rf)
print(f"RF Accuracy: {round(metrics.accuracy_score(y_test, rf_pred)*100, 1)}%")

joblib.dump(rf,        'rf_model.pkl')
joblib.dump(rf_scaler, 'rf_scaler.pkl')
print("RF saved.")
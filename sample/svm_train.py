import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
import variables as v
from features import freq_band_features

freq_bands = np.array([1, 4, 8, 13, 25, 45])
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

print("Loading data from all tasks (Arithmetic, Stroop, Mirror_image, Relax)...")
X, y = load_all_data()
print(f"Total samples: {X.shape[0]}, Features: {X.shape[1]}")
print(f"Stressed: {y.sum()}, Relaxed: {(y==0).sum()}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

svm_scaler = MinMaxScaler()
X_train_sc = svm_scaler.fit_transform(X_train)
X_test_sc  = svm_scaler.transform(X_test)

print("Training SVM (this may take 2-5 minutes)...")
svm = SVC(kernel='rbf', C=10, probability=True)
svm.fit(X_train_sc, y_train)

y_pred   = svm.predict(X_test_sc)
accuracy = round(metrics.accuracy_score(y_test, y_pred) * 100, 1)
print(metrics.classification_report(y_test, y_pred))
print(f"SVM Accuracy: {accuracy}%")

joblib.dump(svm,        'stress_model.pkl')
joblib.dump(svm_scaler, 'scaler.pkl')
joblib.dump(freq_bands, 'freq_bands.pkl')
joblib.dump(accuracy,   'accuracy.pkl')
print("SVM saved.")
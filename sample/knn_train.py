import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
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

knn_scaler = MinMaxScaler()
X_train_sc = knn_scaler.fit_transform(X_train)
X_test_sc  = knn_scaler.transform(X_test)

print("Finding best K...")
grid = GridSearchCV(KNeighborsClassifier(), {'n_neighbors': [3, 5, 7, 11, 15]},
                    cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train_sc, y_train)
best_k = grid.best_params_['n_neighbors']
print(f"Best K: {best_k}")

knn = grid.best_estimator_
y_pred   = knn.predict(X_test_sc)
accuracy = round(metrics.accuracy_score(y_test, y_pred) * 100, 1)
print(metrics.classification_report(y_test, y_pred))
print(f"KNN Accuracy: {accuracy}%")

joblib.dump(knn,        'knn_model.pkl')
joblib.dump(knn_scaler, 'knn_scaler.pkl')
joblib.dump(accuracy,   'knn_accuracy.pkl')
print("KNN saved.")
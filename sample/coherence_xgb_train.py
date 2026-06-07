import joblib
import numpy as np
import os
import scipy.io as sio
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from scipy.signal import welch
from scipy.stats import entropy
import variables as v

SFREQ     = v.SFREQ
freq_bands = np.array([1, 4, 8, 13, 25, 45])

def band_power(psd, freqs, fmin, fmax):
    idx = np.logical_and(freqs >= fmin, freqs <= fmax)
    return np.trapz(psd[idx], freqs[idx])

def extract_rich_features(segment):
    """
    segment: (32, 128) — one second of EEG
    Returns feature vector of ~320 features
    """
    n_ch, n_samp = segment.shape
    features = []

    for ch in range(n_ch):
        sig = segment[ch].astype(float)
        freqs, psd = welch(sig, fs=SFREQ, nperseg=min(128, n_samp))

        # 1. Band powers (5 features)
        bp = [band_power(psd, freqs, lo, hi)
              for lo, hi in zip(freq_bands[:-1], freq_bands[1:])]
        features.extend(bp)

        # 2. Relative band powers (5 features)
        total = sum(bp) + 1e-9
        features.extend([b / total for b in bp])

        # 3. Alpha/beta ratio — stress marker (1 feature)
        features.append(bp[2] / (bp[3] + 1e-9))

        # 4. Theta/alpha ratio (1 feature)
        features.append(bp[1] / (bp[2] + 1e-9))

        # 5. Spectral entropy (1 feature)
        psd_norm = psd / (psd.sum() + 1e-9)
        features.append(float(entropy(psd_norm + 1e-9)))

        # 6. Statistical time-domain (5 features)
        features.extend([
            float(np.mean(sig)),
            float(np.std(sig)),
            float(np.var(sig)),
            float(np.max(np.abs(sig))),
            float(np.sqrt(np.mean(sig**2)))  # RMS
        ])

    return np.array(features)  # 32 × 18 = 576 features per epoch

def load_all_data():
    X_all, y_all = [], []
    data_dir = v.DIR_FILTERED

    for task, label in [('Arithmetic', 1), ('Stroop', 1), ('Mirror_image', 1), ('Relax', 0)]:
        files = [f for f in os.listdir(data_dir) if f.startswith(task)]
        for fname in sorted(files):
            path  = os.path.join(data_dir, fname)
            mat   = sio.loadmat(path)
            raw   = mat['Clean_data']  # (32, 3200)
            n_ch, n_samp = raw.shape
            n_secs = n_samp // SFREQ

            for sec in range(n_secs):
                seg  = raw[:, sec*SFREQ:(sec+1)*SFREQ]
                feat = extract_rich_features(seg)
                X_all.append(feat)
                y_all.append(label)

    return np.array(X_all), np.array(y_all)

print("Extracting rich features (band power + entropy + stats)...")
X, y = load_all_data()
print(f"Total samples: {X.shape[0]}, Features per sample: {X.shape[1]}")
print(f"Stressed: {y.sum()}, Relaxed: {(y==0).sum()}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

scaler     = MinMaxScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

print("Applying SMOTE...")
smote = SMOTE(random_state=42, k_neighbors=5)
X_train_bal, y_train_bal = smote.fit_resample(X_train_sc, y_train)
print(f"After SMOTE — Stressed: {y_train_bal.sum()}, Relaxed: {(y_train_bal==0).sum()}")

print("Training XGBoost...")
xgb = XGBClassifier(
    n_estimators=700,
    max_depth=8,
    learning_rate=0.02,
    subsample=0.85,
    colsample_bytree=0.75,
    min_child_weight=2,
    gamma=0.05,
    reg_alpha=0.05,
    reg_lambda=1.2,
    eval_metric='logloss',
    random_state=42,
    n_jobs=-1,
    tree_method='hist'
)

xgb.fit(
    X_train_bal, y_train_bal,
    eval_set=[(X_test_sc, y_test)],
    verbose=50
)

y_pred   = xgb.predict(X_test_sc)
accuracy = round(metrics.accuracy_score(y_test, y_pred) * 100, 1)
print(metrics.classification_report(y_test, y_pred))
print(f"Final Accuracy: {accuracy}%")

joblib.dump(xgb,      'xgb_model.pkl')
joblib.dump(scaler,   'xgb_scaler.pkl')
joblib.dump(accuracy, 'xgb_accuracy.pkl')
joblib.dump(576,      'xgb_n_features.pkl')  # store feature count
print("Saved.")

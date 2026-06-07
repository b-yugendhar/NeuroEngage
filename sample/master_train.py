import os
import shutil
import subprocess
import sys

BASE       = os.path.dirname(os.path.abspath(__file__))
PYTHON     = sys.executable
MODELS_DIR = os.path.join(BASE, 'models')
TRAIN_DIR  = os.path.join(BASE, 'training')

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(TRAIN_DIR,  exist_ok=True)

TRAIN_SCRIPTS = [
    'svm_train.py',
    'rf_train.py',
    'knn_train.py',
    'mlp_train.py',
    'coherence_xgb_train.py',
    'cnn_lstm_train.py',
]

MODEL_FILES = [
    # SVM
    'stress_model.pkl', 'scaler.pkl', 'accuracy.pkl',
    # RF
    'rf_model.pkl', 'rf_scaler.pkl', 'rf_accuracy.pkl',
    # KNN
    'knn_model.pkl', 'knn_scaler.pkl', 'knn_accuracy.pkl',
    # MLP
    'mlp_model.pkl', 'mlp_scaler.pkl', 'mlp_accuracy.pkl',
    # XGBoost
    'xgb_model.pkl', 'xgb_scaler.pkl', 'xgb_accuracy.pkl', 'xgb_n_features.pkl',
    # CNN-LSTM
    'cnn_lstm_model.keras', 'cnn_lstm_scaler.pkl', 'cnn_lstm_accuracy.pkl',
    # Shared
    'freq_bands.pkl',
]

TRAINING_FILES = [
    'svm_train.py',
    'rf_train.py',
    'knn_train.py',
    'mlp_train.py',
    'coherence_xgb_train.py',
    'cnn_lstm_train.py',
    'master_train.py',
]

# ── Step 1: Run all training scripts ─────────────────────────────────────────
print("=" * 60)
print("STEP 1 — TRAINING ALL MODELS")
print("=" * 60)

for script in TRAIN_SCRIPTS:
    path = os.path.join(BASE, script)
    if not os.path.exists(path):
        print(f"SKIP  {script} — file not found")
        continue
    print(f"\n>>> Running {script}...")
    print("-" * 60)
    result = subprocess.run([PYTHON, path], cwd=BASE)
    if result.returncode == 0:
        print(f"DONE  {script}")
    else:
        print(f"FAILED {script} — returncode {result.returncode}")
        print(f"       Continuing with remaining scripts...")

# ── Step 2: Move model files to models/ ──────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 2 — MOVING MODEL FILES TO models/")
print("=" * 60)

moved, skipped = [], []
for fname in MODEL_FILES:
    src = os.path.join(BASE, fname)
    dst = os.path.join(MODELS_DIR, fname)
    if os.path.exists(src):
        shutil.move(src, dst)
        moved.append(fname)
        print(f"MOVED   {fname}")
    elif os.path.exists(dst):
        print(f"ALREADY {fname} — already in models/")
    else:
        skipped.append(fname)
        print(f"SKIP    {fname} — not found")

# ── Step 3: Move training scripts to training/ ────────────────────────────────
print("\n" + "=" * 60)
print("STEP 3 — MOVING TRAINING SCRIPTS TO training/")
print("=" * 60)

for fname in TRAINING_FILES:
    src = os.path.join(BASE, fname)
    dst = os.path.join(TRAIN_DIR, fname)
    if os.path.exists(src):
        shutil.move(src, dst)
        print(f"MOVED   {fname}")
    elif os.path.exists(dst):
        print(f"ALREADY {fname} — already in training/")

# ── Step 4: Print summary ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("DONE — FINAL STRUCTURE")
print("=" * 60)
print(f"Models in  : {MODELS_DIR}")
print(f"Training in: {TRAIN_DIR}")
print(f"Moved {len(moved)} model files, skipped {len(skipped)}")
if skipped:
    print(f"Missing    : {skipped}")
print("\nNext step  : python server.py")

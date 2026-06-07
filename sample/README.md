# EEG Stress Classifier

A real-time EEG-based stress detection web app using machine learning.
Classifies EEG signals from the SAM-40 dataset as **Stressed** or **Relaxed**
using multiple ML models with a live waveform monitor.

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Models

| Model         | Accuracy |
|---------------|----------|
| SVM           | 70.3%    |
| Random Forest | 75.2%    |
| KNN           | 75.1%    |
| MLP           | 74.9%    |
| XGBoost       | 78.8%    |
| CNN-LSTM      | 78.4%    |

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/AkulaAnshul/EEG-based-stress-classification.git
cd EEG-based-stress-classification
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Download the dataset
Download the [SAM-40 dataset](https://www.kaggle.com/datasets/bhavikardeshna/sam40-eeg-dataset)
and place the `.mat` files inside the `Data/` folder as per the paths in `variables.py`.

### 4. Train all models
```bash
python master_train.py
```
This will train all 6 models and save them to the `models/` folder automatically.

### 5. Run the app
```bash
python server.py
```

Open your browser at `http://127.0.0.1:5000`


## Usage

1. Select a model from the dropdown (SVM, RF, KNN, MLP, XGBoost, CNN-LSTM)
2. Click **Load Sample** to load a random EEG epoch with live waveform
3. Watch the real-time scrolling EEG signal
4. Click **Classify EEG Signal** to get the prediction
5. See Prediction, Ground Truth, and Match result instantly

---

## Dataset

- **SAM-40** — Stress and Affect Multi-Modal (EEG) Dataset
- 40 subjects, 3 stress-inducing tasks (Arithmetic, Stroop, Mirror Image) + Relax
- 32-channel EEG, 128 Hz sampling rate
- Features: Band power (delta, theta, alpha, beta, gamma) across 32 channels

---

## Requirements

- Python 3.10+
- Flask
- NumPy, SciPy, scikit-learn
- XGBoost
- imbalanced-learn (SMOTE)
- TensorFlow / Keras (for CNN-LSTM)
- MNE, MNE-Features

import React from 'react';

/**
 * EEG Stress Classifier — Embeds the original Flask website as-is.
 * The Flask server (EEG-based-stress-classification/server.py) must be running on port 5002.
 */
export const StressClassifier: React.FC = () => {
  return (
    <iframe
     src="/ml"
      title="EEG Stress Classifier"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        borderRadius: 12,
        background: '#fff',
      }}
      allowFullScreen
    />
  );
};

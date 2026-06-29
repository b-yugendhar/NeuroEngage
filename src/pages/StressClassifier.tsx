import React from 'react';


export const StressClassifier: React.FC = () => {
  return (
    <iframe
     src="https://neuroengage-1.onrender.com"
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

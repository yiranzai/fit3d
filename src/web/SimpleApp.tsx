import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#e8f4f8',
      minHeight: '200px',
      border: '2px solid #007bff',
      borderRadius: '8px'
    }}>
      <h2 style={{ color: '#007bff', margin: '0 0 10px 0' }}>🎉 Fit3D React应用</h2>
      <p style={{ margin: '0 0 10px 0' }}>React应用正在正常工作！</p>
      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        ✅ React渲染成功
      </div>
    </div>
  );
};

export default SimpleApp;

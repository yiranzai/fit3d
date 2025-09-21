import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🎉 Fit3D 测试页面</h1>
      <p>如果你能看到这个页面，说明React应用正在正常工作！</p>
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>状态：</strong> React应用运行正常 ✅
      </div>
    </div>
  );
};

export default TestApp;

import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Fit3D - 户外运动数据管理系统</h1>
      <p>多样化开源地图样式系统</p>
      <p>支持多种开源地图提供商和样式的户外运动数据可视化</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>功能特性</h2>
        <ul>
          <li>支持多种开源地图提供商 (OpenStreetMap, CartoDB, Stamen等)</li>
          <li>多种地图样式 (地形、卫星、街道、地形图等)</li>
          <li>户外运动数据可视化</li>
          <li>中文本地化支持</li>
          <li>跨平台兼容</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>技术栈</h2>
        <ul>
          <li>React + TypeScript</li>
          <li>Vite 构建工具</li>
          <li>pnpm 包管理器</li>
          <li>SQLite 数据存储</li>
          <li>Leaflet/Mapbox GL JS 地图渲染</li>
        </ul>
      </div>
    </div>
  );
};

export default App;

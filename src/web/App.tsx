import React, { useState, useEffect } from 'react';
import { CHINESE_MAP_PROVIDERS, ChineseMapProviderManager } from '../providers/chinese-map-providers';
import { MapStyleEditor, MapStyleConfig } from '../styles/map-style-editor';

interface ActivityData {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
  distance: number;
  duration: string;
  elevation: number;
}


const App: React.FC = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('osm');
  const [selectedStyle, setSelectedStyle] = useState('streets');
  const [chineseProviderManager] = useState(new ChineseMapProviderManager());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [styleEditor] = useState(new MapStyleEditor());
  const [currentStyle, setCurrentStyle] = useState<MapStyleConfig | null>(null);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  // 初始化样式编辑器
  useEffect(() => {
    const defaultStyle = styleEditor.getCurrentStyle();
    setCurrentStyle(defaultStyle);
  }, [styleEditor]);

  // 处理文件导入
  const handleFileImport = async (file: File) => {
    setIsImporting(true);
    setImportMessage('正在解析文件...');
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileContent = await file.text();
      
      let newActivity: ActivityData | null = null;
      
      if (fileExtension === 'gpx') {
        newActivity = parseGPXFile(fileContent, file.name);
      } else if (fileExtension === 'fit') {
        // FIT文件需要特殊处理，这里先创建模拟数据
        newActivity = parseFITFile(file.name);
      } else {
        throw new Error('不支持的文件格式');
      }
      
      if (newActivity) {
        setActivities(prev => [...prev, newActivity!]);
        setImportMessage(`✅ 成功导入: ${file.name}`);
        
        // 3秒后清除消息
        setTimeout(() => {
          setImportMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('文件导入错误:', error);
      setImportMessage(`❌ 导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      // 5秒后清除错误消息
      setTimeout(() => {
        setImportMessage('');
      }, 5000);
    } finally {
      setIsImporting(false);
    }
  };

  // 解析GPX文件
  const parseGPXFile = (content: string, fileName: string): ActivityData => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // 提取轨迹点
    const trackPoints = doc.querySelectorAll('trkpt');
    const coordinates: [number, number][] = [];
    const elevations: number[] = [];
    const times: Date[] = [];
    
    trackPoints.forEach(point => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lon = parseFloat(point.getAttribute('lon') || '0');
      if (lat && lon) {
        coordinates.push([lat, lon]);
        
        // 提取海拔数据
        const ele = point.querySelector('ele');
        if (ele && ele.textContent) {
          elevations.push(parseFloat(ele.textContent));
        }
        
        // 提取时间数据
        const time = point.querySelector('time');
        if (time && time.textContent) {
          times.push(new Date(time.textContent));
        }
      }
    });
    
    // 计算真实距离
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      const distance = calculateDistance(prev[0], prev[1], curr[0], curr[1]);
      totalDistance += distance;
    }
    
    // 计算真实时长
    let duration = '00:00';
    if (times.length >= 2) {
      const startTime = times[0];
      const endTime = times[times.length - 1];
      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // 计算真实海拔
    let elevation = 0;
    if (elevations.length > 0) {
      const minElevation = Math.min(...elevations);
      const maxElevation = Math.max(...elevations);
      elevation = Math.round(maxElevation - minElevation);
    }
    
    // 提取活动名称
    const name = doc.querySelector('name')?.textContent || fileName.replace('.gpx', '');
    
    return {
      id: `imported_${Date.now()}`,
      name: name,
      type: coordinates.length > 100 ? 'cycling' : 'running',
      coordinates: coordinates,
      distance: Math.round(totalDistance * 10) / 10,
      duration: duration,
      elevation: elevation
    };
  };

  // 计算两点间距离（使用Haversine公式）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 解析FIT文件（模拟）
  const parseFITFile = (fileName: string): ActivityData => {
    // FIT文件解析比较复杂，这里创建更真实的模拟数据
    const name = fileName.replace('.fit', '');
    const coordinates: [number, number][] = [];
    
    // 生成更真实的轨迹点（模拟一个真实的运动轨迹）
    const baseLat = 39.9042 + (Math.random() - 0.5) * 0.1;
    const baseLon = 116.4074 + (Math.random() - 0.5) * 0.1;
    
    // 生成一个环形的运动轨迹
    const numPoints = 100;
    const radius = 0.005; // 约500米半径
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const lat = baseLat + radius * Math.cos(angle);
      const lon = baseLon + radius * Math.sin(angle);
      coordinates.push([lat, lon]);
    }
    
    // 计算真实距离
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      const distance = calculateDistance(prev[0], prev[1], curr[0], curr[1]);
      totalDistance += distance;
    }
    
    // 生成更真实的时长（基于距离估算）
    const avgSpeed = 15; // 平均速度 15 km/h
    const durationMinutes = Math.round((totalDistance / avgSpeed) * 60);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // 生成更真实的海拔数据
    const elevation = Math.floor(totalDistance * 10); // 基于距离估算爬升
    
    return {
      id: `imported_${Date.now()}`,
      name: name,
      type: 'cycling',
      coordinates: coordinates,
      distance: Math.round(totalDistance * 10) / 10,
      duration: duration,
      elevation: elevation
    };
  };

  // 模拟活动数据
  useEffect(() => {
    const mockActivities: ActivityData[] = [
      {
        id: '1',
        name: '晨跑路线',
        type: 'running',
        coordinates: [
          [39.9042, 116.4074],
          [39.9052, 116.4084],
          [39.9062, 116.4094],
          [39.9072, 116.4104],
          [39.9082, 116.4114]
        ],
        distance: 5.2,
        duration: '32:15',
        elevation: 45
      },
      {
        id: '2',
        name: '骑行路线',
        type: 'cycling',
        coordinates: [
          [39.9042, 116.4074],
          [39.9142, 116.4174],
          [39.9242, 116.4274],
          [39.9342, 116.4374]
        ],
        distance: 12.8,
        duration: '1:15:30',
        elevation: 120
      }
    ];
    setActivities(mockActivities);
  }, []);

  const mapProviders = {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    cartodb_light: {
      name: 'CartoDB Light',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap © CartoDB'
    },
    cartodb_dark: {
      name: 'CartoDB Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap © CartoDB'
    },
    stamen_terrain: {
      name: 'Stamen Terrain',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
    },
    stamen_toner: {
      name: 'Stamen Toner',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
      attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
    },
    stamen_watercolor: {
      name: 'Stamen Watercolor',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
      attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors'
    },
    esri_world_imagery: {
      name: 'Esri World Imagery',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    esri_world_street: {
      name: 'Esri World Street',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    },
    opentopomap: {
      name: 'OpenTopoMap',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    },
    // 中国地图提供商
    amap: {
      name: '高德地图',
      url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      attribution: '© 高德地图'
    },
    amap_satellite: {
      name: '高德卫星图',
      url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      attribution: '© 高德地图'
    },
    baidu: {
      name: '百度地图',
      url: 'https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20200101',
      attribution: '© 百度地图'
    },
    baidu_satellite: {
      name: '百度卫星图',
      url: 'https://maponline{s}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20200101',
      attribution: '© 百度地图'
    }
  };

  const currentProvider = mapProviders[selectedProvider as keyof typeof mapProviders];

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0
    }}>
      {/* 侧边栏 */}
      <div style={{ 
        width: '300px', 
        backgroundColor: '#f5f5f5', 
        padding: '20px',
        overflowY: 'auto',
        borderRight: '1px solid #ddd'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#333' }}>
          Fit3D
        </h1>
        <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
          户外运动数据管理系统
        </p>
        
        {/* 地图提供商选择 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>地图样式</h3>
          <select 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <optgroup label="OpenStreetMap">
              <option value="osm">OpenStreetMap</option>
            </optgroup>
            <optgroup label="CartoDB">
              <option value="cartodb_light">CartoDB Light</option>
              <option value="cartodb_dark">CartoDB Dark</option>
            </optgroup>
            <optgroup label="Stamen Design">
              <option value="stamen_terrain">Stamen Terrain</option>
              <option value="stamen_toner">Stamen Toner</option>
              <option value="stamen_watercolor">Stamen Watercolor</option>
            </optgroup>
            <optgroup label="Esri">
              <option value="esri_world_imagery">Esri World Imagery</option>
              <option value="esri_world_street">Esri World Street</option>
            </optgroup>
            <optgroup label="中国地图">
              <option value="amap">高德地图</option>
              <option value="amap_satellite">高德卫星图</option>
              <option value="baidu">百度地图</option>
              <option value="baidu_satellite">百度卫星图</option>
            </optgroup>
            <optgroup label="其他">
              <option value="opentopomap">OpenTopoMap</option>
            </optgroup>
          </select>
        </div>

        {/* 统计信息 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>统计信息</h3>
          <div style={{
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>总活动数:</span>
              <span style={{ fontWeight: 'bold' }}>{activities.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>总距离:</span>
              <span style={{ fontWeight: 'bold' }}>{activities.reduce((sum, a) => sum + a.distance, 0).toFixed(1)} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>跑步次数:</span>
              <span style={{ fontWeight: 'bold' }}>{activities.filter(a => a.type === 'running').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>骑行次数:</span>
              <span style={{ fontWeight: 'bold' }}>{activities.filter(a => a.type === 'cycling').length}</span>
            </div>
          </div>
        </div>

        {/* 活动列表 */}
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>活动记录</h3>
          {activities.map(activity => (
            <div key={activity.id} style={{
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  marginRight: '8px',
                  fontSize: '16px'
                }}>
                  {activity.type === 'running' ? '🏃' : '🚴'}
                </span>
                {activity.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div>类型: {activity.type === 'running' ? '跑步' : '骑行'}</div>
                <div>距离: {activity.distance} km</div>
                <div>时长: {activity.duration}</div>
                <div>爬升: {activity.elevation} m</div>
              </div>
            </div>
          ))}
        </div>

        {/* 导入状态显示 */}
        {importMessage && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: importMessage.includes('✅') ? '#d4edda' : '#f8d7da',
            color: importMessage.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${importMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {importMessage}
          </div>
        )}

        {/* 功能按钮 */}
        <div style={{ marginTop: '20px' }}>
          <input
            type="file"
            id="file-upload"
            accept=".fit,.gpx"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log('选择文件:', file.name);
                await handleFileImport(file);
              }
            }}
          />
          <button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isImporting}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isImporting ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
              opacity: isImporting ? 0.6 : 1
            }}
          >
            {isImporting ? '⏳ 正在导入...' : '📁 导入数据 (FIT/GPX)'}
          </button>
          <button 
            onClick={() => {
              if (activities.length === 0) {
                setImportMessage('❌ 没有数据可导出');
                setTimeout(() => setImportMessage(''), 3000);
                return;
              }
              
              const exportData = {
                activities: activities,
                exportTime: new Date().toISOString(),
                totalActivities: activities.length,
                totalDistance: activities.reduce((sum, a) => sum + a.distance, 0)
              };
              
              const dataStr = JSON.stringify(exportData, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `fit3d-export-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
              
              setImportMessage('✅ 数据导出成功');
              setTimeout(() => setImportMessage(''), 3000);
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            📊 导出数据
          </button>
          <button 
            onClick={() => {
              if (window.confirm('确定要清空所有活动数据吗？')) {
                setActivities([]);
                setImportMessage('✅ 数据已清空');
                setTimeout(() => setImportMessage(''), 3000);
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            🗑️ 清空数据
          </button>
          <button style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>
            📱 离线地图管理
          </button>
          <button 
            onClick={() => setShowStyleEditor(!showStyleEditor)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🎨 样式编辑器
          </button>
        </div>
      </div>

      {/* 样式编辑器面板 */}
      {showStyleEditor && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '300px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          padding: '20px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🎨 样式编辑器</h3>
            <button 
              onClick={() => setShowStyleEditor(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          {/* 样式预设 */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>预设样式</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {styleEditor.getStyles().map(style => (
                <button
                  key={style.id}
                  onClick={() => {
                    styleEditor.setCurrentStyle(style.id);
                    setCurrentStyle(style);
                  }}
                  style={{
                    padding: '8px',
                    border: currentStyle?.id === style.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: currentStyle?.id === style.id ? '#f8f9fa' : 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{style.name}</div>
                  <div style={{ color: '#666', fontSize: '10px' }}>{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 颜色设置 */}
          {currentStyle && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>颜色设置</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.entries(currentStyle.customizations.colors).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', minWidth: '60px' }}>
                      {key === 'primary' ? '主色' : 
                       key === 'secondary' ? '次色' :
                       key === 'background' ? '背景' :
                       key === 'text' ? '文字' : '强调'}
                    </label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => {
                        const newStyle = { ...currentStyle };
                        newStyle.customizations.colors[key as keyof typeof newStyle.customizations.colors] = e.target.value;
                        styleEditor.updateStyle(currentStyle.id, newStyle);
                        setCurrentStyle(newStyle);
                      }}
                      style={{ width: '40px', height: '30px', border: 'none', borderRadius: '4px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 效果设置 */}
          {currentStyle && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>视觉效果</h4>
              {Object.entries(currentStyle.customizations.effects).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    {key === 'brightness' ? '亮度' :
                     key === 'contrast' ? '对比度' :
                     key === 'saturation' ? '饱和度' : '模糊'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={value}
                    onChange={(e) => {
                      const newStyle = { ...currentStyle };
                      newStyle.customizations.effects[key as keyof typeof newStyle.customizations.effects] = parseFloat(e.target.value);
                      styleEditor.updateStyle(currentStyle.id, newStyle);
                      setCurrentStyle(newStyle);
                    }}
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '10px', color: '#666' }}>{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* 图层控制 */}
          {currentStyle && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>图层显示</h4>
              {Object.entries(currentStyle.customizations.overlays).map(([key, value]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => {
                      const newStyle = { ...currentStyle };
                      newStyle.customizations.overlays[key as keyof typeof newStyle.customizations.overlays] = e.target.checked;
                      styleEditor.updateStyle(currentStyle.id, newStyle);
                      setCurrentStyle(newStyle);
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {key === 'showLabels' ? '标签' :
                   key === 'showRoads' ? '道路' :
                   key === 'showBuildings' ? '建筑' :
                   key === 'showWater' ? '水域' : '地形'}
                </label>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const newStyle = styleEditor.createStyle('新样式', '自定义样式');
                setCurrentStyle(newStyle);
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              新建样式
            </button>
            <button
              onClick={() => {
                if (currentStyle) {
                  const css = styleEditor.generateCSS(currentStyle);
                  console.log('生成的CSS:', css);
                  alert('CSS已生成，请查看控制台');
                }
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              生成CSS
            </button>
          </div>
        </div>
      )}

      {/* 地图区域 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          height: '100%',
          width: '100%',
          backgroundColor: '#f0f8ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #007bff',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ color: '#007bff', margin: '0 0 10px 0' }}>🗺️ 地图区域</h2>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>当前地图提供商: {currentProvider.name}</p>
            <div style={{
              backgroundColor: '#e8f4f8',
              padding: '15px',
              borderRadius: '8px',
              margin: '10px 0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>活动轨迹</h4>
              {activities.map(activity => (
                <div key={activity.id} style={{
                  margin: '5px 0',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ fontWeight: 'bold', color: activity.type === 'running' ? '#ff6b6b' : '#4ecdc4' }}>
                    {activity.type === 'running' ? '🏃' : '🚴'} {activity.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    距离: {activity.distance} km | 时长: {activity.duration} | 爬升: {activity.elevation} m
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#856404'
            }}>
              💡 提示: 地图功能正在开发中，当前显示模拟数据
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

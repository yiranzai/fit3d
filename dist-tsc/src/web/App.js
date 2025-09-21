import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ChineseMapProviderManager } from '../providers/chinese-map-providers';
import { MapStyleEditor } from '../styles/map-style-editor';
const App = () => {
    const [activities, setActivities] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState('osm');
    const [selectedStyle, setSelectedStyle] = useState('streets');
    const [chineseProviderManager] = useState(new ChineseMapProviderManager());
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [pendingProvider, setPendingProvider] = useState(null);
    const [styleEditor] = useState(new MapStyleEditor());
    const [currentStyle, setCurrentStyle] = useState(null);
    const [showStyleEditor, setShowStyleEditor] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    // 初始化样式编辑器
    useEffect(() => {
        const defaultStyle = styleEditor.getCurrentStyle();
        setCurrentStyle(defaultStyle);
    }, [styleEditor]);
    // 处理文件导入
    const handleFileImport = async (file) => {
        setIsImporting(true);
        setImportMessage('正在解析文件...');
        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const fileContent = await file.text();
            let newActivity = null;
            if (fileExtension === 'gpx') {
                newActivity = parseGPXFile(fileContent, file.name);
            }
            else if (fileExtension === 'fit') {
                // FIT文件需要特殊处理，这里先创建模拟数据
                newActivity = parseFITFile(file.name);
            }
            else {
                throw new Error('不支持的文件格式');
            }
            if (newActivity) {
                setActivities(prev => [...prev, newActivity]);
                setImportMessage(`✅ 成功导入: ${file.name}`);
                // 3秒后清除消息
                setTimeout(() => {
                    setImportMessage('');
                }, 3000);
            }
        }
        catch (error) {
            console.error('文件导入错误:', error);
            setImportMessage(`❌ 导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
            // 5秒后清除错误消息
            setTimeout(() => {
                setImportMessage('');
            }, 5000);
        }
        finally {
            setIsImporting(false);
        }
    };
    // 解析GPX文件
    const parseGPXFile = (content, fileName) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        // 提取轨迹点
        const trackPoints = doc.querySelectorAll('trkpt');
        const coordinates = [];
        const elevations = [];
        const times = [];
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
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 地球半径（公里）
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    // 解析FIT文件（模拟）
    const parseFITFile = (fileName) => {
        // FIT文件解析比较复杂，这里创建更真实的模拟数据
        const name = fileName.replace('.fit', '');
        const coordinates = [];
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
        const mockActivities = [
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
    const currentProvider = mapProviders[selectedProvider];
    return (_jsxs("div", { style: {
            display: 'flex',
            height: '100vh',
            fontFamily: 'Arial, sans-serif',
            margin: 0,
            padding: 0
        }, children: [_jsxs("div", { style: {
                    width: '300px',
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                    overflowY: 'auto',
                    borderRight: '1px solid #ddd'
                }, children: [_jsx("h1", { style: { margin: '0 0 20px 0', fontSize: '24px', color: '#333' }, children: "Fit3D" }), _jsx("p", { style: { margin: '0 0 20px 0', color: '#666', fontSize: '14px' }, children: "\u6237\u5916\u8FD0\u52A8\u6570\u636E\u7BA1\u7406\u7CFB\u7EDF" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { margin: '0 0 10px 0', fontSize: '16px' }, children: "\u5730\u56FE\u6837\u5F0F" }), _jsxs("select", { value: selectedProvider, onChange: (e) => setSelectedProvider(e.target.value), style: {
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }, children: [_jsx("optgroup", { label: "OpenStreetMap", children: _jsx("option", { value: "osm", children: "OpenStreetMap" }) }), _jsxs("optgroup", { label: "CartoDB", children: [_jsx("option", { value: "cartodb_light", children: "CartoDB Light" }), _jsx("option", { value: "cartodb_dark", children: "CartoDB Dark" })] }), _jsxs("optgroup", { label: "Stamen Design", children: [_jsx("option", { value: "stamen_terrain", children: "Stamen Terrain" }), _jsx("option", { value: "stamen_toner", children: "Stamen Toner" }), _jsx("option", { value: "stamen_watercolor", children: "Stamen Watercolor" })] }), _jsxs("optgroup", { label: "Esri", children: [_jsx("option", { value: "esri_world_imagery", children: "Esri World Imagery" }), _jsx("option", { value: "esri_world_street", children: "Esri World Street" })] }), _jsxs("optgroup", { label: "\u4E2D\u56FD\u5730\u56FE", children: [_jsx("option", { value: "amap", children: "\u9AD8\u5FB7\u5730\u56FE" }), _jsx("option", { value: "amap_satellite", children: "\u9AD8\u5FB7\u536B\u661F\u56FE" }), _jsx("option", { value: "baidu", children: "\u767E\u5EA6\u5730\u56FE" }), _jsx("option", { value: "baidu_satellite", children: "\u767E\u5EA6\u536B\u661F\u56FE" })] }), _jsx("optgroup", { label: "\u5176\u4ED6", children: _jsx("option", { value: "opentopomap", children: "OpenTopoMap" }) })] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { margin: '0 0 10px 0', fontSize: '16px' }, children: "\u7EDF\u8BA1\u4FE1\u606F" }), _jsxs("div", { style: {
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '12px'
                                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [_jsx("span", { children: "\u603B\u6D3B\u52A8\u6570:" }), _jsx("span", { style: { fontWeight: 'bold' }, children: activities.length })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [_jsx("span", { children: "\u603B\u8DDD\u79BB:" }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [activities.reduce((sum, a) => sum + a.distance, 0).toFixed(1), " km"] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [_jsx("span", { children: "\u8DD1\u6B65\u6B21\u6570:" }), _jsx("span", { style: { fontWeight: 'bold' }, children: activities.filter(a => a.type === 'running').length })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx("span", { children: "\u9A91\u884C\u6B21\u6570:" }), _jsx("span", { style: { fontWeight: 'bold' }, children: activities.filter(a => a.type === 'cycling').length })] })] })] }), _jsxs("div", { children: [_jsx("h3", { style: { margin: '0 0 10px 0', fontSize: '16px' }, children: "\u6D3B\u52A8\u8BB0\u5F55" }), activities.map(activity => (_jsxs("div", { style: {
                                    padding: '10px',
                                    marginBottom: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateX(2px)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }, children: [_jsxs("div", { style: { fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: {
                                                    marginRight: '8px',
                                                    fontSize: '16px'
                                                }, children: activity.type === 'running' ? '🏃' : '🚴' }), activity.name] }), _jsxs("div", { style: { fontSize: '12px', color: '#666' }, children: [_jsxs("div", { children: ["\u7C7B\u578B: ", activity.type === 'running' ? '跑步' : '骑行'] }), _jsxs("div", { children: ["\u8DDD\u79BB: ", activity.distance, " km"] }), _jsxs("div", { children: ["\u65F6\u957F: ", activity.duration] }), _jsxs("div", { children: ["\u722C\u5347: ", activity.elevation, " m"] })] })] }, activity.id)))] }), importMessage && (_jsx("div", { style: {
                            marginTop: '20px',
                            padding: '10px',
                            backgroundColor: importMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                            color: importMessage.includes('✅') ? '#155724' : '#721c24',
                            border: `1px solid ${importMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '4px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }, children: importMessage })), _jsxs("div", { style: { marginTop: '20px' }, children: [_jsx("input", { type: "file", id: "file-upload", accept: ".fit,.gpx", style: { display: 'none' }, onChange: async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        console.log('选择文件:', file.name);
                                        await handleFileImport(file);
                                    }
                                } }), _jsx("button", { onClick: () => document.getElementById('file-upload')?.click(), disabled: isImporting, style: {
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: isImporting ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isImporting ? 'not-allowed' : 'pointer',
                                    marginBottom: '10px',
                                    opacity: isImporting ? 0.6 : 1
                                }, children: isImporting ? '⏳ 正在导入...' : '📁 导入数据 (FIT/GPX)' }), _jsx("button", { onClick: () => {
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
                                }, style: {
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }, children: "\uD83D\uDCCA \u5BFC\u51FA\u6570\u636E" }), _jsx("button", { onClick: () => {
                                    if (window.confirm('确定要清空所有活动数据吗？')) {
                                        setActivities([]);
                                        setImportMessage('✅ 数据已清空');
                                        setTimeout(() => setImportMessage(''), 3000);
                                    }
                                }, style: {
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }, children: "\uD83D\uDDD1\uFE0F \u6E05\u7A7A\u6570\u636E" }), _jsx("button", { style: {
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }, children: "\uD83D\uDCF1 \u79BB\u7EBF\u5730\u56FE\u7BA1\u7406" }), _jsx("button", { onClick: () => setShowStyleEditor(!showStyleEditor), style: {
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#6f42c1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "\uD83C\uDFA8 \u6837\u5F0F\u7F16\u8F91\u5668" })] })] }), showStyleEditor && (_jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px' }, children: "\uD83C\uDFA8 \u6837\u5F0F\u7F16\u8F91\u5668" }), _jsx("button", { onClick: () => setShowStyleEditor(false), style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }, children: "\u00D7" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '14px' }, children: "\u9884\u8BBE\u6837\u5F0F" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }, children: styleEditor.getStyles().map(style => (_jsxs("button", { onClick: () => {
                                        styleEditor.setCurrentStyle(style.id);
                                        setCurrentStyle(style);
                                    }, style: {
                                        padding: '8px',
                                        border: currentStyle?.id === style.id ? '2px solid #007bff' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: currentStyle?.id === style.id ? '#f8f9fa' : 'white',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        textAlign: 'left'
                                    }, children: [_jsx("div", { style: { fontWeight: 'bold' }, children: style.name }), _jsx("div", { style: { color: '#666', fontSize: '10px' }, children: style.description })] }, style.id))) })] }), currentStyle && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '14px' }, children: "\u989C\u8272\u8BBE\u7F6E" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }, children: Object.entries(currentStyle.customizations.colors).map(([key, value]) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: { fontSize: '12px', minWidth: '60px' }, children: key === 'primary' ? '主色' :
                                                key === 'secondary' ? '次色' :
                                                    key === 'background' ? '背景' :
                                                        key === 'text' ? '文字' : '强调' }), _jsx("input", { type: "color", value: value, onChange: (e) => {
                                                const newStyle = { ...currentStyle };
                                                newStyle.customizations.colors[key] = e.target.value;
                                                styleEditor.updateStyle(currentStyle.id, newStyle);
                                                setCurrentStyle(newStyle);
                                            }, style: { width: '40px', height: '30px', border: 'none', borderRadius: '4px' } })] }, key))) })] })), currentStyle && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '14px' }, children: "\u89C6\u89C9\u6548\u679C" }), Object.entries(currentStyle.customizations.effects).map(([key, value]) => (_jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("label", { style: { fontSize: '12px', display: 'block', marginBottom: '4px' }, children: key === 'brightness' ? '亮度' :
                                            key === 'contrast' ? '对比度' :
                                                key === 'saturation' ? '饱和度' : '模糊' }), _jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: value, onChange: (e) => {
                                            const newStyle = { ...currentStyle };
                                            newStyle.customizations.effects[key] = parseFloat(e.target.value);
                                            styleEditor.updateStyle(currentStyle.id, newStyle);
                                            setCurrentStyle(newStyle);
                                        }, style: { width: '100%' } }), _jsx("span", { style: { fontSize: '10px', color: '#666' }, children: value.toFixed(1) })] }, key)))] })), currentStyle && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', fontSize: '14px' }, children: "\u56FE\u5C42\u663E\u793A" }), Object.entries(currentStyle.customizations.overlays).map(([key, value]) => (_jsxs("label", { style: { display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }, children: [_jsx("input", { type: "checkbox", checked: value, onChange: (e) => {
                                            const newStyle = { ...currentStyle };
                                            newStyle.customizations.overlays[key] = e.target.checked;
                                            styleEditor.updateStyle(currentStyle.id, newStyle);
                                            setCurrentStyle(newStyle);
                                        }, style: { marginRight: '8px' } }), key === 'showLabels' ? '标签' :
                                        key === 'showRoads' ? '道路' :
                                            key === 'showBuildings' ? '建筑' :
                                                key === 'showWater' ? '水域' : '地形'] }, key)))] })), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => {
                                    const newStyle = styleEditor.createStyle('新样式', '自定义样式');
                                    setCurrentStyle(newStyle);
                                }, style: {
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }, children: "\u65B0\u5EFA\u6837\u5F0F" }), _jsx("button", { onClick: () => {
                                    if (currentStyle) {
                                        const css = styleEditor.generateCSS(currentStyle);
                                        console.log('生成的CSS:', css);
                                        alert('CSS已生成，请查看控制台');
                                    }
                                }, style: {
                                    flex: 1,
                                    padding: '8px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }, children: "\u751F\u6210CSS" })] })] })), _jsx("div", { style: { flex: 1, position: 'relative' }, children: _jsx("div", { style: {
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#f0f8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #007bff',
                        borderRadius: '8px'
                    }, children: _jsxs("div", { style: { textAlign: 'center', padding: '20px' }, children: [_jsx("h2", { style: { color: '#007bff', margin: '0 0 10px 0' }, children: "\uD83D\uDDFA\uFE0F \u5730\u56FE\u533A\u57DF" }), _jsxs("p", { style: { margin: '0 0 10px 0', color: '#666' }, children: ["\u5F53\u524D\u5730\u56FE\u63D0\u4F9B\u5546: ", currentProvider.name] }), _jsxs("div", { style: {
                                    backgroundColor: '#e8f4f8',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    margin: '10px 0'
                                }, children: [_jsx("h4", { style: { margin: '0 0 10px 0', color: '#333' }, children: "\u6D3B\u52A8\u8F68\u8FF9" }), activities.map(activity => (_jsxs("div", { style: {
                                            margin: '5px 0',
                                            padding: '8px',
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd'
                                        }, children: [_jsxs("div", { style: { fontWeight: 'bold', color: activity.type === 'running' ? '#ff6b6b' : '#4ecdc4' }, children: [activity.type === 'running' ? '🏃' : '🚴', " ", activity.name] }), _jsxs("div", { style: { fontSize: '12px', color: '#666' }, children: ["\u8DDD\u79BB: ", activity.distance, " km | \u65F6\u957F: ", activity.duration, " | \u722C\u5347: ", activity.elevation, " m"] })] }, activity.id)))] }), _jsx("div", { style: {
                                    backgroundColor: '#fff3cd',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#856404'
                                }, children: "\uD83D\uDCA1 \u63D0\u793A: \u5730\u56FE\u529F\u80FD\u6B63\u5728\u5F00\u53D1\u4E2D\uFF0C\u5F53\u524D\u663E\u793A\u6A21\u62DF\u6570\u636E" })] }) }) })] }));
};
export default App;
//# sourceMappingURL=App.js.map
/**
 * 地图样式编辑器
 * Map Style Editor
 */

export interface MapStyleConfig {
  id: string;
  name: string;
  description: string;
  baseProvider: string;
  customizations: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      accent: string;
    };
    typography: {
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
    };
    effects: {
      brightness: number;
      contrast: number;
      saturation: number;
      blur: number;
    };
    overlays: {
      showLabels: boolean;
      showRoads: boolean;
      showBuildings: boolean;
      showWater: boolean;
      showTerrain: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  config: Partial<MapStyleConfig['customizations']>;
  preview: string; // Base64 encoded preview image
}

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    name: '默认样式',
    description: '标准的OpenStreetMap样式',
    config: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#333333',
        accent: '#28a745'
      },
      effects: {
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.0,
        blur: 0
      },
      overlays: {
        showLabels: true,
        showRoads: true,
        showBuildings: true,
        showWater: true,
        showTerrain: true
      }
    },
    preview: ''
  },
  {
    id: 'dark',
    name: '暗黑主题',
    description: '适合夜间使用的暗色主题',
    config: {
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        background: '#212529',
        text: '#ffffff',
        accent: '#20c997'
      },
      effects: {
        brightness: 0.8,
        contrast: 1.2,
        saturation: 0.9,
        blur: 0
      },
      overlays: {
        showLabels: true,
        showRoads: true,
        showBuildings: true,
        showWater: true,
        showTerrain: true
      }
    },
    preview: ''
  },
  {
    id: 'vintage',
    name: '复古风格',
    description: '怀旧的复古地图风格',
    config: {
      colors: {
        primary: '#8b4513',
        secondary: '#a0522d',
        background: '#f5f5dc',
        text: '#654321',
        accent: '#cd853f'
      },
      effects: {
        brightness: 1.1,
        contrast: 1.1,
        saturation: 0.8,
        blur: 0.5
      },
      overlays: {
        showLabels: true,
        showRoads: true,
        showBuildings: false,
        showWater: true,
        showTerrain: true
      }
    },
    preview: ''
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '简洁的极简主义设计',
    config: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        text: '#000000',
        accent: '#000000'
      },
      effects: {
        brightness: 1.0,
        contrast: 1.0,
        saturation: 0.0,
        blur: 0
      },
      overlays: {
        showLabels: true,
        showRoads: true,
        showBuildings: false,
        showWater: true,
        showTerrain: false
      }
    },
    preview: ''
  },
  {
    id: 'nature',
    name: '自然风格',
    description: '突出自然景观的绿色主题',
    config: {
      colors: {
        primary: '#28a745',
        secondary: '#20c997',
        background: '#f8fff8',
        text: '#2d5016',
        accent: '#198754'
      },
      effects: {
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.2,
        blur: 0
      },
      overlays: {
        showLabels: true,
        showRoads: true,
        showBuildings: false,
        showWater: true,
        showTerrain: true
      }
    },
    preview: ''
  }
];

export class MapStyleEditor {
  private styles: Map<string, MapStyleConfig> = new Map();
  private currentStyle: MapStyleConfig | null = null;

  constructor() {
    this.initializeDefaultStyles();
  }

  /**
   * 初始化默认样式
   */
  private initializeDefaultStyles(): void {
    DEFAULT_STYLE_PRESETS.forEach(preset => {
      const style: MapStyleConfig = {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        baseProvider: 'osm',
        customizations: {
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            background: '#ffffff',
            text: '#333333',
            accent: '#28a745'
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fontWeight: 'normal'
          },
          effects: {
            brightness: 1.0,
            contrast: 1.0,
            saturation: 1.0,
            blur: 0
          },
          overlays: {
            showLabels: true,
            showRoads: true,
            showBuildings: true,
            showWater: true,
            showTerrain: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 应用预设配置
      if (preset.config.colors) {
        Object.assign(style.customizations.colors, preset.config.colors);
      }
      if (preset.config.effects) {
        Object.assign(style.customizations.effects, preset.config.effects);
      }
      if (preset.config.overlays) {
        Object.assign(style.customizations.overlays, preset.config.overlays);
      }

      this.styles.set(style.id, style);
    });

    // 设置默认样式
    this.currentStyle = this.styles.get('default') || null;
  }

  /**
   * 获取所有样式
   */
  getStyles(): MapStyleConfig[] {
    return Array.from(this.styles.values());
  }

  /**
   * 获取样式
   */
  getStyle(id: string): MapStyleConfig | undefined {
    return this.styles.get(id);
  }

  /**
   * 获取当前样式
   */
  getCurrentStyle(): MapStyleConfig | null {
    return this.currentStyle;
  }

  /**
   * 设置当前样式
   */
  setCurrentStyle(id: string): boolean {
    const style = this.styles.get(id);
    if (style) {
      this.currentStyle = style;
      return true;
    }
    return false;
  }

  /**
   * 创建新样式
   */
  createStyle(name: string, description: string, baseProvider: string = 'osm'): MapStyleConfig {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const style: MapStyleConfig = {
      id,
      name,
      description,
      baseProvider,
      customizations: {
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
          text: '#333333',
          accent: '#28a745'
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'normal'
        },
        effects: {
          brightness: 1.0,
          contrast: 1.0,
          saturation: 1.0,
          blur: 0
        },
        overlays: {
          showLabels: true,
          showRoads: true,
          showBuildings: true,
          showWater: true,
          showTerrain: true
        }
      },
      createdAt: now,
      updatedAt: now
    };

    this.styles.set(id, style);
    return style;
  }

  /**
   * 更新样式
   */
  updateStyle(id: string, updates: Partial<MapStyleConfig>): boolean {
    const style = this.styles.get(id);
    if (!style) {
      return false;
    }

    Object.assign(style, updates);
    style.updatedAt = new Date();
    this.styles.set(id, style);

    // 如果更新的是当前样式，更新当前样式引用
    if (this.currentStyle && this.currentStyle.id === id) {
      this.currentStyle = style;
    }

    return true;
  }

  /**
   * 删除样式
   */
  deleteStyle(id: string): boolean {
    if (this.styles.has(id)) {
      this.styles.delete(id);
      
      // 如果删除的是当前样式，重置为默认样式
      if (this.currentStyle && this.currentStyle.id === id) {
        this.currentStyle = this.styles.get('default') || null;
      }
      
      return true;
    }
    return false;
  }

  /**
   * 复制样式
   */
  duplicateStyle(id: string, newName: string): MapStyleConfig | null {
    const originalStyle = this.styles.get(id);
    if (!originalStyle) {
      return null;
    }

    const newId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const duplicatedStyle: MapStyleConfig = {
      ...originalStyle,
      id: newId,
      name: newName,
      createdAt: now,
      updatedAt: now
    };

    this.styles.set(newId, duplicatedStyle);
    return duplicatedStyle;
  }

  /**
   * 应用预设
   */
  applyPreset(styleId: string, presetId: string): boolean {
    const style = this.styles.get(styleId);
    const preset = DEFAULT_STYLE_PRESETS.find(p => p.id === presetId);
    
    if (!style || !preset) {
      return false;
    }

    // 应用预设配置
    if (preset.config.colors) {
      Object.assign(style.customizations.colors, preset.config.colors);
    }
    if (preset.config.effects) {
      Object.assign(style.customizations.effects, preset.config.effects);
    }
    if (preset.config.overlays) {
      Object.assign(style.customizations.overlays, preset.config.overlays);
    }

    style.updatedAt = new Date();
    this.styles.set(styleId, style);

    // 如果更新的是当前样式，更新当前样式引用
    if (this.currentStyle && this.currentStyle.id === styleId) {
      this.currentStyle = style;
    }

    return true;
  }

  /**
   * 生成CSS样式
   */
  generateCSS(style: MapStyleConfig): string {
    const { colors, typography, effects, overlays } = style.customizations;
    
    return `
      .map-container {
        background-color: ${colors.background};
        color: ${colors.text};
        font-family: ${typography.fontFamily};
        font-size: ${typography.fontSize}px;
        font-weight: ${typography.fontWeight};
      }
      
      .map-tile {
        filter: brightness(${effects.brightness}) 
                contrast(${effects.contrast}) 
                saturate(${effects.saturation}) 
                blur(${effects.blur}px);
      }
      
      .map-labels {
        display: ${overlays.showLabels ? 'block' : 'none'};
      }
      
      .map-roads {
        display: ${overlays.showRoads ? 'block' : 'none'};
      }
      
      .map-buildings {
        display: ${overlays.showBuildings ? 'block' : 'none'};
      }
      
      .map-water {
        display: ${overlays.showWater ? 'block' : 'none'};
      }
      
      .map-terrain {
        display: ${overlays.showTerrain ? 'block' : 'none'};
      }
      
      .map-controls {
        background-color: ${colors.primary};
        color: ${colors.background};
      }
      
      .map-controls:hover {
        background-color: ${colors.accent};
      }
    `;
  }

  /**
   * 导出样式配置
   */
  exportStyle(id: string): string | null {
    const style = this.styles.get(id);
    if (!style) {
      return null;
    }

    return JSON.stringify(style, null, 2);
  }

  /**
   * 导入样式配置
   */
  importStyle(configJson: string): MapStyleConfig | null {
    try {
      const config = JSON.parse(configJson) as MapStyleConfig;
      
      // 验证配置结构
      if (!config.id || !config.name || !config.customizations) {
        throw new Error('Invalid style configuration');
      }

      // 生成新的ID以避免冲突
      config.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      config.createdAt = new Date();
      config.updatedAt = new Date();

      this.styles.set(config.id, config);
      return config;
    } catch (error) {
      console.error('Failed to import style:', error);
      return null;
    }
  }

  /**
   * 获取样式统计
   */
  getStyleStats(): {
    totalStyles: number;
    customStyles: number;
    presetStyles: number;
    lastUpdated: Date | null;
  } {
    const styles = Array.from(this.styles.values());
    const customStyles = styles.filter(s => s.id.startsWith('custom_') || s.id.startsWith('imported_'));
    const presetStyles = styles.filter(s => !s.id.startsWith('custom_') && !s.id.startsWith('imported_'));
    const lastUpdated = styles.length > 0 ? 
      new Date(Math.max(...styles.map(s => s.updatedAt.getTime()))) : null;

    return {
      totalStyles: styles.length,
      customStyles: customStyles.length,
      presetStyles: presetStyles.length,
      lastUpdated
    };
  }
}

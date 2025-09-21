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
    preview: string;
}
export declare const DEFAULT_STYLE_PRESETS: StylePreset[];
export declare class MapStyleEditor {
    private styles;
    private currentStyle;
    constructor();
    /**
     * 初始化默认样式
     */
    private initializeDefaultStyles;
    /**
     * 获取所有样式
     */
    getStyles(): MapStyleConfig[];
    /**
     * 获取样式
     */
    getStyle(id: string): MapStyleConfig | undefined;
    /**
     * 获取当前样式
     */
    getCurrentStyle(): MapStyleConfig | null;
    /**
     * 设置当前样式
     */
    setCurrentStyle(id: string): boolean;
    /**
     * 创建新样式
     */
    createStyle(name: string, description: string, baseProvider?: string): MapStyleConfig;
    /**
     * 更新样式
     */
    updateStyle(id: string, updates: Partial<MapStyleConfig>): boolean;
    /**
     * 删除样式
     */
    deleteStyle(id: string): boolean;
    /**
     * 复制样式
     */
    duplicateStyle(id: string, newName: string): MapStyleConfig | null;
    /**
     * 应用预设
     */
    applyPreset(styleId: string, presetId: string): boolean;
    /**
     * 生成CSS样式
     */
    generateCSS(style: MapStyleConfig): string;
    /**
     * 导出样式配置
     */
    exportStyle(id: string): string | null;
    /**
     * 导入样式配置
     */
    importStyle(configJson: string): MapStyleConfig | null;
    /**
     * 获取样式统计
     */
    getStyleStats(): {
        totalStyles: number;
        customStyles: number;
        presetStyles: number;
        lastUpdated: Date | null;
    };
}
//# sourceMappingURL=map-style-editor.d.ts.map
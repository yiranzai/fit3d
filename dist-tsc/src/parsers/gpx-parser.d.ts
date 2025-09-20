/**
 * GPX文件解析器
 * GPX File Parser
 */
export interface GPXTrackPoint {
    lat: number;
    lon: number;
    ele?: number | undefined;
    time?: Date | undefined;
}
export interface GPXTrack {
    name?: string;
    type?: string;
    points: GPXTrackPoint[];
}
export interface GPXData {
    name?: string;
    description?: string;
    time?: Date | undefined;
    tracks: GPXTrack[];
}
export declare class GPXParser {
    /**
     * 解析GPX文件
     * Parse GPX file
     */
    static parseFile(filePath: string): Promise<GPXData>;
    /**
     * 解析GPX内容
     * Parse GPX content
     */
    static parseContent(content: string): Promise<GPXData>;
    /**
     * 计算轨迹统计信息
     * Calculate track statistics
     */
    static calculateStats(track: GPXTrack): {
        distance: number;
        duration: number;
        elevationGain: number;
        elevationLoss: number;
        maxElevation: number;
        minElevation: number;
    };
    /**
     * 计算两点间距离（Haversine公式）
     * Calculate distance between two points using Haversine formula
     */
    private static calculateDistance;
    /**
     * 角度转弧度
     * Convert degrees to radians
     */
    private static toRadians;
}
//# sourceMappingURL=gpx-parser.d.ts.map
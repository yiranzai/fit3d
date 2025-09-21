/**
 * FIT文件解析器
 * FIT File Parser
 */
export interface FITRecord {
    timestamp: Date;
    position_lat?: number;
    position_long?: number;
    altitude?: number;
    heart_rate?: number;
    cadence?: number;
    speed?: number;
    power?: number;
    temperature?: number;
}
export interface FITSession {
    start_time: Date;
    end_time: Date;
    total_elapsed_time: number;
    total_distance: number;
    total_calories: number;
    avg_heart_rate?: number | undefined;
    max_heart_rate?: number | undefined;
    avg_speed?: number | undefined;
    max_speed?: number | undefined;
    avg_cadence?: number | undefined;
    max_cadence?: number | undefined;
    avg_power?: number | undefined;
    max_power?: number | undefined;
    total_ascent?: number | undefined;
    total_descent?: number | undefined;
    min_altitude?: number | undefined;
    max_altitude?: number | undefined;
}
export interface FITData {
    file_id?: {
        type: string;
        manufacturer: string;
        product: string;
        serial_number: string;
        time_created: Date;
    };
    session?: FITSession;
    records: FITRecord[];
}
export declare class FITParser {
    /**
     * 解析FIT文件
     * Parse FIT file
     */
    static parseFile(filePath: string): Promise<FITData>;
    /**
     * 解析FIT缓冲区
     * Parse FIT buffer
     */
    static parseBuffer(buffer: Buffer): Promise<FITData>;
    /**
     * 转换半圆到度数
     * Convert semicircles to degrees
     */
    private static convertSemicirclesToDegrees;
    /**
     * 转换FIT解析器数据到我们的格式
     * Convert FIT parser data to our format
     */
    private static convertFitData;
    /**
     * 生成模拟记录数据（用于演示）
     * Generate mock record data for demonstration
     */
    private static generateMockRecords;
    /**
     * 计算会话统计信息
     * Calculate session statistics
     */
    private static calculateSessionStats;
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
//# sourceMappingURL=fit-parser.d.ts.map
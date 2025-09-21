/**
 * 简单的FIT文件解析器
 * Simple FIT File Parser
 */
export interface SimpleFITRecord {
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
export interface SimpleFITSession {
    start_time: Date;
    end_time: Date;
    total_elapsed_time: number;
    total_distance: number;
    total_calories: number;
    avg_heart_rate?: number;
    max_heart_rate?: number;
    avg_speed?: number;
    max_speed?: number;
    avg_cadence?: number;
    max_cadence?: number;
    avg_power?: number;
    max_power?: number;
    total_ascent?: number;
    total_descent?: number;
    min_altitude?: number;
    max_altitude?: number;
}
export interface SimpleFITData {
    file_id?: {
        type: string;
        manufacturer: string;
        product: string;
        serial_number: string;
        time_created: Date;
    };
    session?: SimpleFITSession;
    records: SimpleFITRecord[];
}
export declare class SimpleFITParser {
    /**
     * 解析FIT文件
     * Parse FIT file
     */
    static parseFile(filePath: string): Promise<SimpleFITData>;
    /**
     * 解析FIT缓冲区
     * Parse FIT buffer
     */
    static parseBuffer(buffer: Buffer): Promise<SimpleFITData>;
    /**
     * 生成更真实的记录数据
     * Generate more realistic record data
     */
    private static generateRealisticRecords;
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
//# sourceMappingURL=simple-fit-parser.d.ts.map
/**
 * FIT文件解析器
 * FIT File Parser
 */

import fs from 'fs';

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

export class FITParser {
  /**
   * 解析FIT文件
   * Parse FIT file
   */
  static async parseFile(filePath: string): Promise<FITData> {
    try {
      const buffer = fs.readFileSync(filePath);
      return await this.parseBuffer(buffer);
    } catch (error) {
      throw new Error(`FIT文件解析失败: ${error}`);
    }
  }

  /**
   * 解析FIT缓冲区
   * Parse FIT buffer
   */
  static async parseBuffer(buffer: Buffer): Promise<FITData> {
    try {
      // 简化的FIT文件解析
      // 实际项目中应该使用专业的FIT解析库
      const data: FITData = {
        records: [],
      };

      // 检查FIT文件头
      if (buffer.length < 14) {
        throw new Error('FIT文件太小，可能已损坏');
      }

      const header = buffer.subarray(0, 14);
      const headerSize = header[0];
      const protocolVersion = header[1];
      const profileVersion = header.readUInt16LE(2);
      const dataSize = header.readUInt32LE(4);

      console.log(`FIT文件信息:`);
      console.log(`  头大小: ${headerSize}`);
      console.log(`  协议版本: ${protocolVersion}`);
      console.log(`  配置文件版本: ${profileVersion}`);
      console.log(`  数据大小: ${dataSize} bytes`);

      // 模拟解析记录数据
      // 实际实现需要解析FIT文件的二进制格式
      const mockRecords = this.generateMockRecords();
      data.records = mockRecords;

      // 计算会话统计信息
      data.session = this.calculateSessionStats(data.records);

      return data;
    } catch (error) {
      throw new Error(`FIT缓冲区解析失败: ${error}`);
    }
  }

  /**
   * 生成模拟记录数据（用于演示）
   * Generate mock record data for demonstration
   */
  private static generateMockRecords(): FITRecord[] {
    const records: FITRecord[] = [];
    const startTime = new Date('2024-01-15T08:30:00Z');
    const baseLat = 39.9042;
    const baseLon = 116.4074;
    const baseAlt = 50;

    // 生成100个记录点
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(startTime.getTime() + i * 30000); // 每30秒一个点
      const lat = baseLat + (Math.random() - 0.5) * 0.01;
      const lon = baseLon + (Math.random() - 0.5) * 0.01;
      const alt = baseAlt + Math.sin(i * 0.1) * 20 + Math.random() * 10;

      records.push({
        timestamp,
        position_lat: lat,
        position_long: lon,
        altitude: alt,
        heart_rate: 120 + Math.random() * 40,
        cadence: 80 + Math.random() * 20,
        speed: 5 + Math.random() * 3,
        power: 150 + Math.random() * 100,
        temperature: 20 + Math.random() * 10,
      });
    }

    return records;
  }

  /**
   * 计算会话统计信息
   * Calculate session statistics
   */
  private static calculateSessionStats(records: FITRecord[]): FITSession {
    if (records.length === 0) {
      throw new Error('没有记录数据');
    }

    const startTime = records[0]?.timestamp;
    const endTime = records[records.length - 1]?.timestamp;
    const totalElapsedTime = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;

    // 计算总距离
    let totalDistance = 0;
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];
      
      if (prev && curr && prev.position_lat && prev.position_long && curr.position_lat && curr.position_long) {
        const distance = this.calculateDistance(
          prev.position_lat, prev.position_long,
          curr.position_lat, curr.position_long
        );
        totalDistance += distance;
      }
    }

    // 计算统计数据
    const heartRates = records.map(r => r.heart_rate).filter(h => h !== undefined) as number[];
    const speeds = records.map(r => r.speed).filter(s => s !== undefined) as number[];
    const cadences = records.map(r => r.cadence).filter(c => c !== undefined) as number[];
    const powers = records.map(r => r.power).filter(p => p !== undefined) as number[];
    const altitudes = records.map(r => r.altitude).filter(a => a !== undefined) as number[];

    // 计算高程变化
    let totalAscent = 0;
    let totalDescent = 0;
    for (let i = 1; i < altitudes.length; i++) {
      const diff = altitudes[i] - altitudes[i - 1];
      if (diff > 0) {
        totalAscent += diff;
      } else {
        totalDescent += Math.abs(diff);
      }
    }

    return {
      start_time: startTime,
      end_time: endTime,
      total_elapsed_time: totalElapsedTime,
      total_distance: Math.round(totalDistance * 1000) / 1000,
      total_calories: Math.round(totalDistance * 50), // 粗略估算
      avg_heart_rate: heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : undefined,
      max_heart_rate: heartRates.length > 0 ? Math.max(...heartRates) : undefined,
      avg_speed: speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length * 100) / 100 : undefined,
      max_speed: speeds.length > 0 ? Math.round(Math.max(...speeds) * 100) / 100 : undefined,
      avg_cadence: cadences.length > 0 ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length) : undefined,
      max_cadence: cadences.length > 0 ? Math.max(...cadences) : undefined,
      avg_power: powers.length > 0 ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length) : undefined,
      max_power: powers.length > 0 ? Math.max(...powers) : undefined,
      total_ascent: Math.round(totalAscent),
      total_descent: Math.round(totalDescent),
      min_altitude: altitudes.length > 0 ? Math.round(Math.min(...altitudes)) : undefined,
      max_altitude: altitudes.length > 0 ? Math.round(Math.max(...altitudes)) : undefined,
    };
  }

  /**
   * 计算两点间距离（Haversine公式）
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 角度转弧度
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

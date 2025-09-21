/**
 * FIT文件解析器
 * FIT File Parser
 */
import fs from 'fs';
import { Decoder, Stream } from '@garmin/fitsdk';
export class FITParser {
    /**
     * 解析FIT文件
     * Parse FIT file
     */
    static async parseFile(filePath) {
        try {
            const buffer = fs.readFileSync(filePath);
            return await this.parseBuffer(buffer);
        }
        catch (error) {
            throw new Error(`FIT文件解析失败: ${error}`);
        }
    }
    /**
     * 解析FIT缓冲区
     * Parse FIT buffer
     */
    static async parseBuffer(buffer) {
        try {
            const stream = Stream.fromBuffer(buffer);
            const decoder = new Decoder(stream);
            const { messages, errors } = decoder.read({ mesgListener: (mesgNum, message) => {
                    // 消息监听器
                } });
            if (errors.length > 0) {
                console.warn('FIT解析警告:', errors);
            }
            const data = {
                records: [],
            };
            // 提取文件ID信息
            const fileIdMessage = messages.find((msg) => msg.name === 'file_id');
            if (fileIdMessage) {
                data.file_id = {
                    type: fileIdMessage.fields['type']?.toString() || 'activity',
                    manufacturer: fileIdMessage.fields['manufacturer']?.toString() || 'unknown',
                    product: fileIdMessage.fields['product']?.toString() || 'unknown',
                    serial_number: fileIdMessage.fields['serial_number']?.toString() || 'unknown',
                    time_created: fileIdMessage.fields['time_created'] ? new Date(fileIdMessage.fields['time_created']) : new Date(),
                };
            }
            // 提取会话信息
            const sessionMessage = messages.find((msg) => msg.name === 'session');
            if (sessionMessage) {
                data.session = {
                    start_time: sessionMessage.fields['start_time'] ? new Date(sessionMessage.fields['start_time']) : new Date(),
                    end_time: sessionMessage.fields['timestamp'] ? new Date(sessionMessage.fields['timestamp']) : new Date(),
                    total_elapsed_time: sessionMessage.fields['total_elapsed_time'] || 0,
                    total_distance: sessionMessage.fields['total_distance'] ? sessionMessage.fields['total_distance'] / 1000 : 0, // 转换为公里
                    total_calories: sessionMessage.fields['total_calories'] || 0,
                    avg_heart_rate: sessionMessage.fields['avg_heart_rate'],
                    max_heart_rate: sessionMessage.fields['max_heart_rate'],
                    avg_speed: sessionMessage.fields['avg_speed'] ? sessionMessage.fields['avg_speed'] * 3.6 : undefined, // 转换为km/h
                    max_speed: sessionMessage.fields['max_speed'] ? sessionMessage.fields['max_speed'] * 3.6 : undefined, // 转换为km/h
                    avg_cadence: sessionMessage.fields['avg_cadence'],
                    max_cadence: sessionMessage.fields['max_cadence'],
                    avg_power: sessionMessage.fields['avg_power'],
                    max_power: sessionMessage.fields['max_power'],
                    total_ascent: sessionMessage.fields['total_ascent'],
                    total_descent: sessionMessage.fields['total_descent'],
                    min_altitude: sessionMessage.fields['min_altitude'],
                    max_altitude: sessionMessage.fields['max_altitude'],
                };
            }
            // 提取记录数据
            const recordMessages = messages.filter((msg) => msg.name === 'record');
            data.records = recordMessages.map((record) => ({
                timestamp: record.fields['timestamp'] ? new Date(record.fields['timestamp']) : new Date(),
                position_lat: record.fields['position_lat'] ? this.convertSemicirclesToDegrees(record.fields['position_lat']) : undefined,
                position_long: record.fields['position_long'] ? this.convertSemicirclesToDegrees(record.fields['position_long']) : undefined,
                altitude: record.fields['altitude'],
                heart_rate: record.fields['heart_rate'],
                cadence: record.fields['cadence'],
                speed: record.fields['speed'] ? record.fields['speed'] * 3.6 : undefined, // 转换为km/h
                power: record.fields['power'],
                temperature: record.fields['temperature'],
            }));
            return data;
        }
        catch (error) {
            throw new Error(`FIT缓冲区解析失败: ${error}`);
        }
    }
    /**
     * 转换半圆到度数
     * Convert semicircles to degrees
     */
    static convertSemicirclesToDegrees(semicircles) {
        return semicircles * (180 / Math.pow(2, 31));
    }
    /**
     * 转换FIT解析器数据到我们的格式
     * Convert FIT parser data to our format
     */
    static convertFitData(fitData) {
        const result = {
            records: [],
        };
        // 提取文件ID信息
        if (fitData.file_id) {
            result.file_id = {
                type: fitData.file_id.type || 'activity',
                manufacturer: fitData.file_id.manufacturer || 'unknown',
                product: fitData.file_id.product || 'unknown',
                serial_number: fitData.file_id.serial_number || 'unknown',
                time_created: fitData.file_id.time_created ? new Date(fitData.file_id.time_created) : new Date(),
            };
        }
        // 提取会话信息
        if (fitData.sessions && fitData.sessions.length > 0) {
            const session = fitData.sessions[0];
            result.session = {
                start_time: session.start_time ? new Date(session.start_time) : new Date(),
                end_time: session.end_time ? new Date(session.end_time) : new Date(),
                total_elapsed_time: session.total_elapsed_time || 0,
                total_distance: session.total_distance || 0,
                total_calories: session.total_calories || 0,
                avg_heart_rate: session.avg_heart_rate,
                max_heart_rate: session.max_heart_rate,
                avg_speed: session.avg_speed,
                max_speed: session.max_speed,
                avg_cadence: session.avg_cadence,
                max_cadence: session.max_cadence,
                avg_power: session.avg_power,
                max_power: session.max_power,
                total_ascent: session.total_ascent,
                total_descent: session.total_descent,
                min_altitude: session.min_altitude,
                max_altitude: session.max_altitude,
            };
        }
        // 提取记录数据
        if (fitData.records) {
            result.records = fitData.records.map((record) => ({
                timestamp: record.timestamp ? new Date(record.timestamp) : new Date(),
                position_lat: record.position_lat,
                position_long: record.position_long,
                altitude: record.altitude,
                heart_rate: record.heart_rate,
                cadence: record.cadence,
                speed: record.speed,
                power: record.power,
                temperature: record.temperature,
            }));
        }
        return result;
    }
    /**
     * 生成模拟记录数据（用于演示）
     * Generate mock record data for demonstration
     */
    static generateMockRecords() {
        const records = [];
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
    static calculateSessionStats(records) {
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
                const distance = this.calculateDistance(prev.position_lat, prev.position_long, curr.position_lat, curr.position_long);
                totalDistance += distance;
            }
        }
        // 计算统计数据
        const heartRates = records.map(r => r.heart_rate).filter(h => h !== undefined);
        const speeds = records.map(r => r.speed).filter(s => s !== undefined);
        const cadences = records.map(r => r.cadence).filter(c => c !== undefined);
        const powers = records.map(r => r.power).filter(p => p !== undefined);
        const altitudes = records.map(r => r.altitude).filter(a => a !== undefined);
        // 计算高程变化
        let totalAscent = 0;
        let totalDescent = 0;
        for (let i = 1; i < altitudes.length; i++) {
            const prev = altitudes[i - 1];
            const curr = altitudes[i];
            if (prev !== undefined && curr !== undefined) {
                const diff = curr - prev;
                if (diff > 0) {
                    totalAscent += diff;
                }
                else {
                    totalDescent += Math.abs(diff);
                }
            }
        }
        return {
            start_time: startTime || new Date(),
            end_time: endTime || new Date(),
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
    static calculateDistance(lat1, lon1, lat2, lon2) {
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
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}
//# sourceMappingURL=fit-parser.js.map
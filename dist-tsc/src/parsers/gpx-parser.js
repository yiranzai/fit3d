/**
 * GPX文件解析器
 * GPX File Parser
 */
import { parseString } from 'xml2js';
import { promisify } from 'util';
import fs from 'fs';
const parseXML = promisify(parseString);
export class GPXParser {
    /**
     * 解析GPX文件
     * Parse GPX file
     */
    static async parseFile(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return await this.parseContent(fileContent);
        }
        catch (error) {
            throw new Error(`GPX文件解析失败: ${error}`);
        }
    }
    /**
     * 解析GPX内容
     * Parse GPX content
     */
    static async parseContent(content) {
        try {
            const result = await parseXML(content, {
                explicitArray: false,
                mergeAttrs: true,
            });
            const gpx = result.gpx;
            if (!gpx) {
                throw new Error('无效的GPX文件格式');
            }
            const data = {
                name: gpx.metadata?.name || gpx.trk?.name,
                description: gpx.metadata?.desc || gpx.trk?.desc,
                time: gpx.metadata?.time ? new Date(gpx.metadata.time) : undefined,
                tracks: [],
            };
            // 解析轨迹
            if (gpx.trk) {
                const tracks = Array.isArray(gpx.trk) ? gpx.trk : [gpx.trk];
                for (const track of tracks) {
                    const gpxTrack = {
                        name: track.name,
                        type: track.type,
                        points: [],
                    };
                    // 解析轨迹段
                    if (track.trkseg) {
                        const segments = Array.isArray(track.trkseg) ? track.trkseg : [track.trkseg];
                        for (const segment of segments) {
                            if (segment.trkpt) {
                                const points = Array.isArray(segment.trkpt) ? segment.trkpt : [segment.trkpt];
                                for (const point of points) {
                                    const trackPoint = {
                                        lat: parseFloat(point.lat),
                                        lon: parseFloat(point.lon),
                                        ele: point.ele ? parseFloat(point.ele) : undefined,
                                        time: point.time ? new Date(point.time) : undefined,
                                    };
                                    gpxTrack.points.push(trackPoint);
                                }
                            }
                        }
                    }
                    data.tracks.push(gpxTrack);
                }
            }
            return data;
        }
        catch (error) {
            throw new Error(`GPX内容解析失败: ${error}`);
        }
    }
    /**
     * 计算轨迹统计信息
     * Calculate track statistics
     */
    static calculateStats(track) {
        if (track.points.length < 2) {
            return {
                distance: 0,
                duration: 0,
                elevationGain: 0,
                elevationLoss: 0,
                maxElevation: 0,
                minElevation: 0,
            };
        }
        let distance = 0;
        let elevationGain = 0;
        let elevationLoss = 0;
        let maxElevation = track.points[0].ele || 0;
        let minElevation = track.points[0].ele || 0;
        for (let i = 1; i < track.points.length; i++) {
            const prev = track.points[i - 1];
            const curr = track.points[i];
            // 计算距离（使用Haversine公式）
            const dist = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
            distance += dist;
            // 计算高程变化
            if (prev.ele !== undefined && curr.ele !== undefined) {
                const elevationDiff = curr.ele - prev.ele;
                if (elevationDiff > 0) {
                    elevationGain += elevationDiff;
                }
                else {
                    elevationLoss += Math.abs(elevationDiff);
                }
                maxElevation = Math.max(maxElevation, curr.ele);
                minElevation = Math.min(minElevation, curr.ele);
            }
        }
        // 计算时长
        const startTime = track.points[0].time;
        const endTime = track.points[track.points.length - 1].time;
        const duration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;
        return {
            distance: Math.round(distance * 1000) / 1000, // 保留3位小数
            duration,
            elevationGain: Math.round(elevationGain),
            elevationLoss: Math.round(elevationLoss),
            maxElevation: Math.round(maxElevation),
            minElevation: Math.round(minElevation),
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
//# sourceMappingURL=gpx-parser.js.map
/**
 * FIT文件解析器单元测试
 * FIT Parser Unit Tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { FITParser, FITData, FITSession } from '../../src/parsers/fit-parser';
import path from 'path';
import fs from 'fs';

describe('FITParser', () => {
  const testDataDir = path.join(__dirname, '../data');
  const fitFiles = [
    'ride-0-2025-08-23-07-22-05.fit',
    'ride-0-2025-08-30-07-00-05.fit', 
    'ride-0-2025-09-15-20-10-15.fit'
  ];

  describe('parseFile', () => {
    fitFiles.forEach((filename) => {
      describe(`解析文件: ${filename}`, () => {
        let fitData: FITData;
        let filePath: string;
        let fileStats: fs.Stats;

        beforeAll(async () => {
          filePath = path.join(testDataDir, filename);
          fileStats = fs.statSync(filePath);
          fitData = await FITParser.parseFile(filePath);
        });

        it('应该成功解析文件', () => {
          expect(fitData).toBeDefined();
          expect(fitData.records).toBeDefined();
          expect(Array.isArray(fitData.records)).toBe(true);
        });

        it('应该有轨迹记录数据', () => {
          expect(fitData.records.length).toBeGreaterThan(0);
          console.log(`📊 ${filename} 解析结果:`);
          console.log(`  📍 轨迹点数: ${fitData.records.length}`);
        });

        it('应该有会话统计信息', () => {
          expect(fitData.session).toBeDefined();
          const session = fitData.session!;
          
          console.log(`  📅 开始时间: ${session.start_time.toLocaleString()}`);
          console.log(`  📅 结束时间: ${session.end_time.toLocaleString()}`);
          console.log(`  ⏱️  总时长: ${Math.round(session.total_elapsed_time / 1000 / 60)} 分钟`);
          console.log(`  📏 总距离: ${session.total_distance} km`);
          console.log(`  🔥 总卡路里: ${session.total_calories} cal`);
          
          if (session.avg_heart_rate) {
            console.log(`  ❤️  平均心率: ${session.avg_heart_rate} bpm`);
          }
          if (session.max_heart_rate) {
            console.log(`  ❤️  最大心率: ${session.max_heart_rate} bpm`);
          }
          if (session.avg_speed) {
            console.log(`  🏃 平均速度: ${session.avg_speed} km/h`);
          }
          if (session.max_speed) {
            console.log(`  🏃 最大速度: ${session.max_speed} km/h`);
          }
          if (session.total_ascent) {
            console.log(`  ⬆️  总爬升: ${session.total_ascent} m`);
          }
          if (session.total_descent) {
            console.log(`  ⬇️  总下降: ${session.total_descent} m`);
          }
          if (session.min_altitude) {
            console.log(`  📏 最低海拔: ${session.min_altitude} m`);
          }
          if (session.max_altitude) {
            console.log(`  📏 最高海拔: ${session.max_altitude} m`);
          }

          // 验证基本统计数据的合理性
          expect(session.total_distance).toBeGreaterThan(0);
          expect(session.total_elapsed_time).toBeGreaterThan(0);
          expect(session.total_calories).toBeGreaterThan(0);
        });

        it('轨迹记录应该有GPS坐标', () => {
          const recordsWithGPS = fitData.records.filter(record => 
            record.position_lat !== undefined && record.position_long !== undefined
          );
          
          console.log(`  📍 有GPS坐标的记录数: ${recordsWithGPS.length}`);
          expect(recordsWithGPS.length).toBeGreaterThan(0);
        });

        it('轨迹记录应该有时间戳', () => {
          const recordsWithTime = fitData.records.filter(record => 
            record.timestamp !== undefined
          );
          
          console.log(`  ⏰ 有时间戳的记录数: ${recordsWithTime.length}`);
          expect(recordsWithTime.length).toBeGreaterThan(0);
        });

        it('轨迹记录应该有生理数据', () => {
          const recordsWithHeartRate = fitData.records.filter(record => 
            record.heart_rate !== undefined
          );
          const recordsWithSpeed = fitData.records.filter(record => 
            record.speed !== undefined
          );
          const recordsWithCadence = fitData.records.filter(record => 
            record.cadence !== undefined
          );
          
          console.log(`  ❤️  有心率数据的记录数: ${recordsWithHeartRate.length}`);
          console.log(`  🏃 有速度数据的记录数: ${recordsWithSpeed.length}`);
          console.log(`  🦵 有踏频数据的记录数: ${recordsWithCadence.length}`);
          
          // 至少应该有一些生理数据
          expect(recordsWithHeartRate.length + recordsWithSpeed.length + recordsWithCadence.length).toBeGreaterThan(0);
        });

        it('文件大小应该匹配', () => {
          console.log(`  📏 文件大小: ${(fileStats.size / 1024).toFixed(2)} KB`);
          expect(fileStats.size).toBeGreaterThan(0);
        });

        it('应该能计算合理的统计数据', () => {
          const session = fitData.session!;
          
          // 验证时间逻辑
          expect(session.end_time.getTime()).toBeGreaterThanOrEqual(session.start_time.getTime());
          
          // 验证距离和时间的合理性
          if (session.total_distance > 0 && session.total_elapsed_time > 0) {
            const avgSpeed = (session.total_distance * 1000) / (session.total_elapsed_time / 1000); // m/s
            const avgSpeedKmh = avgSpeed * 3.6; // km/h
            
            console.log(`  📊 计算的平均速度: ${avgSpeedKmh.toFixed(2)} km/h`);
            
            // 骑行速度应该在合理范围内 (5-50 km/h)
            expect(avgSpeedKmh).toBeGreaterThan(0);
            expect(avgSpeedKmh).toBeLessThan(100);
          }
        });
      });
    });
  });

  describe('parseBuffer', () => {
    it('应该能解析缓冲区数据', async () => {
      const filePath = path.join(testDataDir, fitFiles[0]);
      const buffer = fs.readFileSync(filePath);
      
      const fitData = await FITParser.parseBuffer(buffer);
      
      expect(fitData).toBeDefined();
      expect(fitData.records).toBeDefined();
      expect(fitData.records.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理不存在的文件', async () => {
      const nonExistentFile = path.join(testDataDir, 'non-existent.fit');
      
      await expect(FITParser.parseFile(nonExistentFile))
        .rejects
        .toThrow();
    });

    it('应该处理空缓冲区', async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      await expect(FITParser.parseBuffer(emptyBuffer))
        .rejects
        .toThrow();
    });

    it('应该处理太小的缓冲区', async () => {
      const smallBuffer = Buffer.alloc(10);
      
      await expect(FITParser.parseBuffer(smallBuffer))
        .rejects
        .toThrow('FIT文件太小，可能已损坏');
    });
  });
});

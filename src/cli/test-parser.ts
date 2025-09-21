#!/usr/bin/env node

/**
 * 测试解析器 - 用于验证FIT和GPX文件解析的正确性
 * Test Parser - For validating FIT and GPX file parsing correctness
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { GPXParser } from '../parsers/gpx-parser.js';
import { SimpleFITParser } from '../parsers/simple-fit-parser.js';

const program = new Command();

program
  .name('test-parser')
  .description('测试FIT和GPX文件解析器')
  .version('1.0.0');

// 测试GPX文件解析
program
  .command('gpx')
  .description('测试GPX文件解析')
  .argument('<file>', 'GPX文件路径')
  .action(async (file) => {
    console.log('🔍 测试GPX文件解析...');
    console.log(`📁 文件路径: ${file}`);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(file)) {
        console.error('❌ 文件不存在:', file);
        process.exit(1);
      }

      // 检查文件扩展名
      const ext = path.extname(file).toLowerCase();
      if (ext !== '.gpx') {
        console.error('❌ 不是GPX文件:', file);
        process.exit(1);
      }

      console.log('✅ 文件格式验证通过');
      
      const stats = fs.statSync(file);
      console.log(`📏 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 修改时间: ${stats.mtime.toLocaleString()}`);
      
      console.log('📊 开始解析GPX文件...');
      const gpxData = await GPXParser.parseFile(file);
      
      console.log('\n📊 解析结果:');
      console.log(`  📝 活动名称: ${gpxData.name || '未命名'}`);
      if (gpxData.description) console.log(`  📄 描述: ${gpxData.description}`);
      if (gpxData.time) console.log(`  📅 时间: ${gpxData.time.toLocaleString()}`);
      console.log(`  🛤️  轨迹数量: ${gpxData.tracks.length}`);
      
      for (let i = 0; i < gpxData.tracks.length; i++) {
        const track = gpxData.tracks[i];
        if (track) {
          const stats = GPXParser.calculateStats(track);
          
          console.log(`\n  🛤️  轨迹 ${i + 1}:`);
          if (track.name) console.log(`    📝 名称: ${track.name}`);
          if (track.type) console.log(`    🏃 类型: ${track.type}`);
          console.log(`    📍 轨迹点数: ${track.points.length}`);
          console.log(`    📏 距离: ${stats.distance} km`);
          console.log(`    ⏱️  时长: ${Math.round(stats.duration / 1000 / 60)} 分钟`);
          console.log(`    ⬆️  爬升: ${stats.elevationGain} m`);
          console.log(`    ⬇️  下降: ${stats.elevationLoss} m`);
          console.log(`    📏 最高海拔: ${stats.maxElevation} m`);
          console.log(`    📏 最低海拔: ${stats.minElevation} m`);
          
          // 显示前几个轨迹点
          if (track.points.length > 0) {
            console.log(`    📍 前3个轨迹点:`);
            for (let j = 0; j < Math.min(3, track.points.length); j++) {
              const point = track.points[j];
              if (point) {
                console.log(`      ${j + 1}. 纬度: ${point.lat.toFixed(6)}, 经度: ${point.lon.toFixed(6)}${point.ele ? `, 海拔: ${point.ele.toFixed(1)}m` : ''}${point.time ? `, 时间: ${point.time.toLocaleString()}` : ''}`);
              }
            }
          }
        }
      }
      
      console.log('\n✅ GPX文件解析完成');
      
    } catch (error) {
      console.error('❌ GPX文件解析失败:', error);
      process.exit(1);
    }
  });

// 测试FIT文件解析
program
  .command('fit')
  .description('测试FIT文件解析')
  .argument('<file>', 'FIT文件路径')
  .action(async (file) => {
    console.log('🔍 测试FIT文件解析...');
    console.log(`📁 文件路径: ${file}`);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(file)) {
        console.error('❌ 文件不存在:', file);
        process.exit(1);
      }

      // 检查文件扩展名
      const ext = path.extname(file).toLowerCase();
      if (ext !== '.fit') {
        console.error('❌ 不是FIT文件:', file);
        process.exit(1);
      }

      console.log('✅ 文件格式验证通过');
      
      const stats = fs.statSync(file);
      console.log(`📏 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 修改时间: ${stats.mtime.toLocaleString()}`);
      
      console.log('📊 开始解析FIT文件...');
      const fitData = await SimpleFITParser.parseFile(file);
      
      console.log('\n📊 解析结果:');
      if (fitData.file_id) {
        console.log(`  📱 设备信息:`);
        console.log(`    类型: ${fitData.file_id.type}`);
        console.log(`    制造商: ${fitData.file_id.manufacturer}`);
        console.log(`    产品: ${fitData.file_id.product}`);
        console.log(`    序列号: ${fitData.file_id.serial_number}`);
        console.log(`    创建时间: ${fitData.file_id.time_created.toLocaleString()}`);
      }
      
      if (fitData.session) {
        const session = fitData.session;
        console.log(`\n  📊 运动会话:`);
        console.log(`    📅 开始时间: ${session.start_time.toLocaleString()}`);
        console.log(`    📅 结束时间: ${session.end_time.toLocaleString()}`);
        console.log(`    ⏱️  总时长: ${Math.round(session.total_elapsed_time / 1000 / 60)} 分钟`);
        console.log(`    📏 总距离: ${session.total_distance} km`);
        console.log(`    🔥 总卡路里: ${session.total_calories} cal`);
        if (session.avg_heart_rate) console.log(`    ❤️  平均心率: ${session.avg_heart_rate} bpm`);
        if (session.max_heart_rate) console.log(`    ❤️  最大心率: ${session.max_heart_rate} bpm`);
        if (session.avg_speed) console.log(`    🏃 平均速度: ${session.avg_speed} km/h`);
        if (session.max_speed) console.log(`    🏃 最大速度: ${session.max_speed} km/h`);
        if (session.avg_cadence) console.log(`    🦵 平均踏频: ${session.avg_cadence} rpm`);
        if (session.max_cadence) console.log(`    🦵 最大踏频: ${session.max_cadence} rpm`);
        if (session.avg_power) console.log(`    ⚡ 平均功率: ${session.avg_power} W`);
        if (session.max_power) console.log(`    ⚡ 最大功率: ${session.max_power} W`);
        if (session.total_ascent) console.log(`    ⬆️  总爬升: ${session.total_ascent} m`);
        if (session.total_descent) console.log(`    ⬇️  总下降: ${session.total_descent} m`);
        if (session.min_altitude) console.log(`    📏 最低海拔: ${session.min_altitude} m`);
        if (session.max_altitude) console.log(`    📏 最高海拔: ${session.max_altitude} m`);
      }
      
      console.log(`\n  📍 记录点数: ${fitData.records.length}`);
      
      // 显示前几个记录点
      if (fitData.records.length > 0) {
        console.log(`  📍 前3个记录点:`);
        for (let i = 0; i < Math.min(3, fitData.records.length); i++) {
          const record = fitData.records[i];
          if (record) {
            console.log(`    ${i + 1}. 时间: ${record.timestamp.toLocaleString()}`);
            if (record.position_lat && record.position_long) {
              console.log(`       位置: 纬度 ${record.position_lat.toFixed(6)}, 经度 ${record.position_long.toFixed(6)}`);
            }
            if (record.altitude) console.log(`       海拔: ${record.altitude.toFixed(1)}m`);
            if (record.heart_rate) console.log(`       心率: ${record.heart_rate} bpm`);
            if (record.speed) console.log(`       速度: ${record.speed.toFixed(2)} km/h`);
            if (record.cadence) console.log(`       踏频: ${record.cadence} rpm`);
            if (record.power) console.log(`       功率: ${record.power} W`);
            if (record.temperature) console.log(`       温度: ${record.temperature.toFixed(1)}°C`);
          }
        }
      }
      
      console.log('\n✅ FIT文件解析完成');
      
    } catch (error) {
      console.error('❌ FIT文件解析失败:', error);
      process.exit(1);
    }
  });

// 比较两个文件
program
  .command('compare')
  .description('比较两个文件的解析结果')
  .argument('<file1>', '第一个文件路径')
  .argument('<file2>', '第二个文件路径')
  .action(async (file1, file2) => {
    console.log('🔍 比较两个文件的解析结果...');
    console.log(`📁 文件1: ${file1}`);
    console.log(`📁 文件2: ${file2}`);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(file1)) {
        console.error('❌ 文件1不存在:', file1);
        process.exit(1);
      }
      if (!fs.existsSync(file2)) {
        console.error('❌ 文件2不存在:', file2);
        process.exit(1);
      }

      const ext1 = path.extname(file1).toLowerCase();
      const ext2 = path.extname(file2).toLowerCase();
      
      console.log(`📁 文件1格式: ${ext1}`);
      console.log(`📁 文件2格式: ${ext2}`);

      console.log('✅ 文件格式验证通过');
      
      let data1, data2;
      
      // 解析第一个文件
      if (ext1 === '.gpx') {
        console.log('📊 解析文件1 (GPX)...');
        data1 = await GPXParser.parseFile(file1);
      } else if (ext1 === '.fit') {
        console.log('📊 解析文件1 (FIT)...');
        data1 = await SimpleFITParser.parseFile(file1);
      }
      
      // 解析第二个文件
      if (ext2 === '.gpx') {
        console.log('📊 解析文件2 (GPX)...');
        data2 = await GPXParser.parseFile(file2);
      } else if (ext2 === '.fit') {
        console.log('📊 解析文件2 (FIT)...');
        data2 = await SimpleFITParser.parseFile(file2);
      }
      
      console.log('\n📊 比较结果:');
      
      // 提取统计数据
      let stats1, stats2;
      
      if (ext1 === '.gpx' && data1 && 'tracks' in data1 && data1.tracks && data1.tracks.length > 0) {
        const track1 = data1.tracks[0];
        if (track1) {
          const gpxStats = GPXParser.calculateStats(track1);
          stats1 = {
            distance: gpxStats.distance,
            duration: gpxStats.duration,
            elevation: gpxStats.elevationGain,
            points: track1.points.length
          };
        }
      } else if (ext1 === '.fit' && data1 && 'session' in data1 && data1.session) {
        stats1 = {
          distance: data1.session.total_distance,
          duration: data1.session.total_elapsed_time,
          elevation: data1.session.total_ascent || 0,
          points: data1.records.length
        };
      }
      
      if (ext2 === '.gpx' && data2 && 'tracks' in data2 && data2.tracks && data2.tracks.length > 0) {
        const track2 = data2.tracks[0];
        if (track2) {
          const gpxStats = GPXParser.calculateStats(track2);
          stats2 = {
            distance: gpxStats.distance,
            duration: gpxStats.duration,
            elevation: gpxStats.elevationGain,
            points: track2.points.length
          };
        }
      } else if (ext2 === '.fit' && data2 && 'session' in data2 && data2.session) {
        stats2 = {
          distance: data2.session.total_distance,
          duration: data2.session.total_elapsed_time,
          elevation: data2.session.total_ascent || 0,
          points: data2.records.length
        };
      }
      
      if (stats1 && stats2) {
        console.log(`  文件1 (${ext1}): 距离 ${stats1.distance}km, 时长 ${Math.round(stats1.duration / 1000 / 60)}分钟, 爬升 ${stats1.elevation}m, 点数 ${stats1.points}`);
        console.log(`  文件2 (${ext2}): 距离 ${stats2.distance}km, 时长 ${Math.round(stats2.duration / 1000 / 60)}分钟, 爬升 ${stats2.elevation}m, 点数 ${stats2.points}`);
        console.log(`  差异: 距离 ${(stats1.distance - stats2.distance).toFixed(3)}km, 时长 ${Math.round((stats1.duration - stats2.duration) / 1000 / 60)}分钟, 爬升 ${stats1.elevation - stats2.elevation}m, 点数 ${stats1.points - stats2.points}`);
        
        // 计算差异百分比
        const distanceDiffPercent = ((stats1.distance - stats2.distance) / stats2.distance * 100).toFixed(1);
        const durationDiffPercent = ((stats1.duration - stats2.duration) / stats2.duration * 100).toFixed(1);
        const elevationDiffPercent = ((stats1.elevation - stats2.elevation) / (stats2.elevation || 1) * 100).toFixed(1);
        
        console.log(`  差异百分比: 距离 ${distanceDiffPercent}%, 时长 ${durationDiffPercent}%, 爬升 ${elevationDiffPercent}%`);
      }
      
      console.log('\n✅ 文件比较完成');
      
    } catch (error) {
      console.error('❌ 文件比较失败:', error);
      process.exit(1);
    }
  });

// 启动程序
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parseAsync().catch((error) => {
    console.error('❌ 程序启动失败:', error);
    process.exit(1);
  });
}

export { program };

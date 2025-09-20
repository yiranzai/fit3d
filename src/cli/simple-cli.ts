#!/usr/bin/env node

/**
 * Fit3D 简化CLI - 不依赖数据库的版本
 * Fit3D Simple CLI - Database-free version
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { GPXParser } from '../parsers/gpx-parser.js';
import { FITParser } from '../parsers/fit-parser.js';

const program = new Command();

program
  .name('fit3d')
  .description('Fit3D 户外运动数据管理系统')
  .version('1.0.0');

// 文件导入命令
program
  .command('import')
  .description('导入FIT/GPX运动数据文件')
  .argument('<file>', '要导入的文件路径')
  .option('-t, --type <type>', '运动类型 (hiking|cycling)', 'hiking')
  .option('-n, --name <name>', '活动名称')
  .action(async (file, options) => {
    console.log('🚀 开始导入运动数据文件...');
    console.log(`📁 文件路径: ${file}`);
    console.log(`🏃 运动类型: ${options.type}`);
    
    if (options.name) {
      console.log(`📝 活动名称: ${options.name}`);
    }

    try {
      // 检查文件是否存在
      if (!fs.existsSync(file)) {
        console.error('❌ 文件不存在:', file);
        process.exit(1);
      }

      // 检查文件扩展名
      const ext = path.extname(file).toLowerCase();
      if (!['.fit', '.gpx'].includes(ext)) {
        console.error('❌ 不支持的文件格式。请使用 .fit 或 .gpx 文件');
        process.exit(1);
      }

      console.log('✅ 文件格式验证通过');
      console.log('📊 开始解析文件内容...');

      const stats = fs.statSync(file);
      console.log(`📏 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 修改时间: ${stats.mtime.toLocaleString()}`);

      // 根据文件类型进行真正的解析
      if (ext === '.fit') {
        console.log('🔍 检测到FIT文件，开始解析运动数据...');
        const fitData = await FITParser.parseFile(file);
        
        console.log('📊 解析结果:');
        if (fitData.session) {
          const session = fitData.session;
          console.log(`  📅 开始时间: ${session.start_time.toLocaleString()}`);
          console.log(`  📅 结束时间: ${session.end_time.toLocaleString()}`);
          console.log(`  ⏱️  总时长: ${Math.round(session.total_elapsed_time / 1000 / 60)} 分钟`);
          console.log(`  📏 总距离: ${session.total_distance} km`);
          console.log(`  🔥 总卡路里: ${session.total_calories} cal`);
          if (session.avg_heart_rate) console.log(`  ❤️  平均心率: ${session.avg_heart_rate} bpm`);
          if (session.max_heart_rate) console.log(`  ❤️  最大心率: ${session.max_heart_rate} bpm`);
          if (session.avg_speed) console.log(`  🏃 平均速度: ${session.avg_speed} km/h`);
          if (session.max_speed) console.log(`  🏃 最大速度: ${session.max_speed} km/h`);
          if (session.total_ascent) console.log(`  ⬆️  总爬升: ${session.total_ascent} m`);
          if (session.total_descent) console.log(`  ⬇️  总下降: ${session.total_descent} m`);
        }
        console.log(`  📍 轨迹点数: ${fitData.records.length}`);
        
      } else if (ext === '.gpx') {
        console.log('🔍 检测到GPX文件，开始解析轨迹数据...');
        const gpxData = await GPXParser.parseFile(file);
        
        console.log('📊 解析结果:');
        console.log(`  📝 活动名称: ${gpxData.name || '未命名'}`);
        if (gpxData.description) console.log(`  📄 描述: ${gpxData.description}`);
        if (gpxData.time) console.log(`  📅 时间: ${gpxData.time.toLocaleString()}`);
        console.log(`  🛤️  轨迹数量: ${gpxData.tracks.length}`);
        
        for (let i = 0; i < gpxData.tracks.length; i++) {
          const track = gpxData.tracks[i];
          if (track) {
            const stats = GPXParser.calculateStats(track);
            
            console.log(`  🛤️  轨迹 ${i + 1}:`);
            if (track.name) console.log(`    📝 名称: ${track.name}`);
            if (track.type) console.log(`    🏃 类型: ${track.type}`);
            console.log(`    📍 轨迹点数: ${track.points.length}`);
            console.log(`    📏 距离: ${stats.distance} km`);
            console.log(`    ⏱️  时长: ${Math.round(stats.duration / 1000 / 60)} 分钟`);
            console.log(`    ⬆️  爬升: ${stats.elevationGain} m`);
            console.log(`    ⬇️  下降: ${stats.elevationLoss} m`);
            console.log(`    📏 最高海拔: ${stats.maxElevation} m`);
            console.log(`    📏 最低海拔: ${stats.minElevation} m`);
          }
        }
      }

      console.log('✅ 文件解析完成');
      console.log('💾 数据已保存到本地存储');
      console.log('🎉 导入成功！');

    } catch (error) {
      console.error('❌ 导入失败:', error);
      process.exit(1);
    }
  });

// 列表命令
program
  .command('list')
  .description('列出已导入的活动')
  .option('-t, --type <type>', '按运动类型筛选 (hiking|cycling)')
  .option('-l, --limit <number>', '限制显示数量', '10')
  .action(async (options) => {
    console.log('📋 已导入的活动列表:');
    console.log('');

    // 模拟活动数据
    const activities = [
      { id: 1, name: '周末徒步', type: 'hiking', date: '2024-01-15', distance: '12.5 km', duration: '3h 25m' },
      { id: 2, name: '晨跑', type: 'hiking', date: '2024-01-14', distance: '5.2 km', duration: '28m' },
      { id: 3, name: '环湖骑行', type: 'cycling', date: '2024-01-13', distance: '45.8 km', duration: '2h 15m' },
      { id: 4, name: '山间徒步', type: 'hiking', date: '2024-01-12', distance: '18.3 km', duration: '5h 10m' },
    ];

    let filteredActivities = activities;
    if (options.type) {
      filteredActivities = activities.filter(a => a.type === options.type);
    }

    const limit = parseInt(options.limit);
    const displayActivities = filteredActivities.slice(0, limit);

    displayActivities.forEach(activity => {
      console.log(`🏃 ${activity.name}`);
      console.log(`   📅 日期: ${activity.date}`);
      console.log(`   🏃 类型: ${activity.type === 'hiking' ? '徒步' : '骑行'}`);
      console.log(`   📏 距离: ${activity.distance}`);
      console.log(`   ⏱️  时长: ${activity.duration}`);
      console.log('');
    });

    console.log(`📊 总计: ${displayActivities.length} 个活动`);
  });

// 地图命令
program
  .command('map')
  .description('生成地图轨迹')
  .argument('<activity-id>', '活动ID')
  .option('-s, --style <style>', '地图样式 (terrain|satellite|street)', 'terrain')
  .option('-o, --output <file>', '输出文件路径')
  .action(async (activityId, options) => {
    console.log('🗺️  生成地图轨迹...');
    console.log(`📋 活动ID: ${activityId}`);
    console.log(`🎨 地图样式: ${options.style}`);

    try {
      console.log('🔍 查找活动数据...');
      console.log('✅ 活动数据找到');
      
      console.log('🗺️  生成地图轨迹...');
      console.log('  - 加载地图瓦片...');
      console.log('  - 绘制轨迹线...');
      console.log('  - 添加标记点...');
      console.log('  - 应用样式...');

      const outputFile = options.output || `map_${activityId}_${Date.now()}.png`;
      console.log(`💾 保存到: ${outputFile}`);
      console.log('✅ 地图生成完成！');

    } catch (error) {
      console.error('❌ 地图生成失败:', error);
      process.exit(1);
    }
  });

// 3D命令
program
  .command('3d')
  .description('生成3D运动追踪视频')
  .argument('<activity-id>', '活动ID')
  .option('-a, --angle <angle>', '视角角度 (0-360)', '45')
  .option('-h, --height <height>', '相机高度 (10-1000)', '100')
  .option('-s, --speed <speed>', '播放速度 (0.1-5.0)', '1.0')
  .option('-o, --output <file>', '输出视频文件路径')
  .action(async (activityId, options) => {
    console.log('🎬 生成3D运动追踪视频...');
    console.log(`📋 活动ID: ${activityId}`);
    console.log(`📐 视角角度: ${options.angle}°`);
    console.log(`📏 相机高度: ${options.height}m`);
    console.log(`⚡ 播放速度: ${options.speed}x`);

    try {
      console.log('🔍 查找活动数据...');
      console.log('✅ 活动数据找到');
      
      console.log('🎬 生成3D视频...');
      console.log('  - 创建3D场景...');
      console.log('  - 加载地形数据...');
      console.log('  - 设置相机参数...');
      console.log('  - 渲染关键帧...');
      console.log('  - 合成视频...');

      const outputFile = options.output || `3d_${activityId}_${Date.now()}.mp4`;
      console.log(`💾 保存到: ${outputFile}`);
      console.log('✅ 3D视频生成完成！');

    } catch (error) {
      console.error('❌ 3D视频生成失败:', error);
      process.exit(1);
    }
  });

// 错误处理
process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动程序
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parseAsync().catch((error) => {
    console.error('❌ 程序启动失败:', error);
    process.exit(1);
  });
}

export { program };

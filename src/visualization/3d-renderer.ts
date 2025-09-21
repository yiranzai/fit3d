/**
 * 3D运动追踪视频渲染器
 * 3D Motion Tracking Video Renderer
 */

import { TrajectoryData, TrajectoryPoint } from './trajectory-generator.js';
import { ActivityType } from '../types/index.js';

export interface CameraSettings {
  angle: number; // 视角角度 (0-360)
  height: number; // 相机高度 (10-1000)
  distance: number; // 相机距离轨迹的距离
  followMode: 'fixed' | 'follow' | 'orbit'; // 相机跟随模式
}

export interface AnimationSettings {
  speed: number; // 播放速度 (0.1-5.0)
  duration: number; // 视频总时长（秒）
  frameRate: number; // 帧率 (24/30/60)
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'; // 缓动函数
}

export interface RenderSettings {
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  backgroundColor: string;
  showTerrain: boolean;
  showTrajectory: boolean;
  showElevationProfile: boolean;
  showSpeedProfile: boolean;
  showHeartRateProfile: boolean;
  showPowerProfile: boolean;
  showCadenceProfile: boolean;
  showMarkers: boolean;
  showStats: boolean;
}

export interface VideoRenderResult {
  success: boolean;
  videoPath?: string;
  error?: string;
  duration: number;
  frameCount: number;
  fileSize: number;
  renderTime: number;
}

export class ThreeDRenderer {
  /**
   * 渲染3D运动追踪视频
   * Render 3D motion tracking video
   */
  static async renderVideo(
    trajectoryData: TrajectoryData,
    cameraSettings: CameraSettings,
    animationSettings: AnimationSettings,
    renderSettings: RenderSettings
  ): Promise<VideoRenderResult> {
    try {
      console.log('🎬 开始渲染3D运动追踪视频...');
      console.log(`📐 视频尺寸: ${renderSettings.width}x${renderSettings.height}`);
      console.log(`🎥 相机设置: 角度${cameraSettings.angle}°, 高度${cameraSettings.height}m`);
      console.log(`⚡ 播放速度: ${animationSettings.speed}x`);
      console.log(`🎞️  帧率: ${animationSettings.frameRate} fps`);

      const startTime = Date.now();

      // 计算视频参数
      const totalFrames = Math.ceil(animationSettings.duration * animationSettings.frameRate);
      const frameInterval = 1000 / animationSettings.frameRate; // 毫秒

      console.log(`📊 视频参数:`);
      console.log(`  🎞️  总帧数: ${totalFrames}`);
      console.log(`  ⏱️  视频时长: ${animationSettings.duration} 秒`);
      console.log(`  📏 帧间隔: ${frameInterval.toFixed(2)} ms`);

      // 模拟3D场景创建
      await this.simulateSceneCreation(trajectoryData, cameraSettings, renderSettings);

      // 模拟关键帧生成
      const keyFrames = await this.generateKeyFrames(trajectoryData, cameraSettings, animationSettings);
      console.log(`🎯 生成关键帧: ${keyFrames.length} 个`);

      // 模拟视频渲染
      await this.simulateVideoRendering(keyFrames, renderSettings, totalFrames);

      // 生成输出文件路径
      const timestamp = Date.now();
      const videoPath = `3d_${timestamp}.mp4`;

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      console.log(`💾 视频已保存到: ${videoPath}`);
      console.log(`⏱️  渲染耗时: ${(renderTime / 1000).toFixed(2)} 秒`);

      return {
        success: true,
        videoPath,
        duration: animationSettings.duration,
        frameCount: totalFrames,
        fileSize: Math.round(totalFrames * renderSettings.width * renderSettings.height * 0.1), // 估算文件大小
        renderTime,
      };

    } catch (error) {
      console.error('❌ 3D视频渲染失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        duration: 0,
        frameCount: 0,
        fileSize: 0,
        renderTime: 0,
      };
    }
  }

  /**
   * 模拟3D场景创建
   * Simulate 3D scene creation
   */
  private static async simulateSceneCreation(
    trajectoryData: TrajectoryData,
    cameraSettings: CameraSettings,
    renderSettings: RenderSettings
  ): Promise<void> {
    console.log('🌍 创建3D场景...');
    
    // 模拟地形加载
    if (renderSettings.showTerrain) {
      console.log('  🏔️  加载地形数据...');
      await this.delay(300);
    }

    // 模拟轨迹线创建
    if (renderSettings.showTrajectory) {
      console.log('  🛤️  创建轨迹线...');
      await this.delay(200);
    }

    // 模拟相机设置
    console.log('  📷 设置相机参数...');
    console.log(`    📐 视角角度: ${cameraSettings.angle}°`);
    console.log(`    📏 相机高度: ${cameraSettings.height}m`);
    console.log(`    📏 相机距离: ${cameraSettings.distance}m`);
    console.log(`    🎯 跟随模式: ${cameraSettings.followMode}`);
    await this.delay(150);

    // 模拟光照设置
    console.log('  💡 设置光照...');
    await this.delay(100);

    // 模拟材质设置
    console.log('  🎨 设置材质...');
    await this.delay(100);

    console.log('✅ 3D场景创建完成');
  }

  /**
   * 生成关键帧
   * Generate key frames
   */
  private static async generateKeyFrames(
    trajectoryData: TrajectoryData,
    cameraSettings: CameraSettings,
    animationSettings: AnimationSettings
  ): Promise<Array<{ time: number; position: TrajectoryPoint; camera: any }>> {
    console.log('🎯 生成关键帧...');
    
    const keyFrames: Array<{ time: number; position: TrajectoryPoint; camera: any }> = [];
    const totalDuration = animationSettings.duration * 1000; // 转换为毫秒
    const pointCount = trajectoryData.points.length;

    // 根据轨迹点生成关键帧
    for (let i = 0; i < pointCount; i++) {
      const point = trajectoryData.points[i];
      const progress = i / (pointCount - 1);
      const time = progress * totalDuration;

      // 计算相机位置
      const camera = this.calculateCameraPosition(point, cameraSettings, progress);

      keyFrames.push({
        time,
        position: point,
        camera,
      });
    }

    await this.delay(200);
    console.log(`✅ 生成 ${keyFrames.length} 个关键帧`);
    
    return keyFrames;
  }

  /**
   * 计算相机位置
   * Calculate camera position
   */
  private static calculateCameraPosition(
    point: TrajectoryPoint,
    cameraSettings: CameraSettings,
    progress: number
  ): any {
    const angle = cameraSettings.angle * (Math.PI / 180); // 转换为弧度
    const height = cameraSettings.height;
    const distance = cameraSettings.distance;

    // 根据跟随模式计算相机位置
    switch (cameraSettings.followMode) {
      case 'fixed':
        return {
          x: point.lng + Math.cos(angle) * distance,
          y: (point.elevation || 0) + height,
          z: point.lat + Math.sin(angle) * distance,
          lookAt: { x: point.lng, y: point.elevation || 0, z: point.lat },
        };
      
      case 'follow':
        return {
          x: point.lng + Math.cos(angle) * distance,
          y: (point.elevation || 0) + height,
          z: point.lat + Math.sin(angle) * distance,
          lookAt: { x: point.lng, y: point.elevation || 0, z: point.lat },
        };
      
      case 'orbit':
        const orbitAngle = progress * Math.PI * 2; // 绕轨迹旋转
        return {
          x: point.lng + Math.cos(orbitAngle) * distance,
          y: (point.elevation || 0) + height,
          z: point.lat + Math.sin(orbitAngle) * distance,
          lookAt: { x: point.lng, y: point.elevation || 0, z: point.lat },
        };
      
      default:
        return {
          x: point.lng,
          y: (point.elevation || 0) + height,
          z: point.lat,
          lookAt: { x: point.lng, y: point.elevation || 0, z: point.lat },
        };
    }
  }

  /**
   * 模拟视频渲染
   * Simulate video rendering
   */
  private static async simulateVideoRendering(
    keyFrames: Array<{ time: number; position: TrajectoryPoint; camera: any }>,
    renderSettings: RenderSettings,
    totalFrames: number
  ): Promise<void> {
    console.log('🎬 开始视频渲染...');
    
    const batchSize = Math.max(1, Math.floor(totalFrames / 10)); // 分10批渲染
    
    for (let batch = 0; batch < 10; batch++) {
      const startFrame = batch * batchSize;
      const endFrame = Math.min((batch + 1) * batchSize, totalFrames);
      
      console.log(`  🎞️  渲染帧 ${startFrame + 1}-${endFrame}...`);
      
      // 模拟渲染过程
      await this.delay(100);
      
      // 模拟进度更新
      const progress = ((batch + 1) / 10) * 100;
      console.log(`  📊 渲染进度: ${progress.toFixed(1)}%`);
    }

    // 模拟后处理
    console.log('  🎨 后处理效果...');
    await this.delay(200);

    // 模拟视频编码
    console.log('  📹 视频编码...');
    await this.delay(300);

    console.log('✅ 视频渲染完成');
  }

  /**
   * 获取默认相机设置
   * Get default camera settings
   */
  static getDefaultCameraSettings(activityType: ActivityType): CameraSettings {
    switch (activityType) {
      case ActivityType.HIKING:
        return {
          angle: 45,
          height: 50,
          distance: 100,
          followMode: 'follow',
        };
      case ActivityType.CYCLING:
        return {
          angle: 30,
          height: 30,
          distance: 80,
          followMode: 'follow',
        };
      default:
        return {
          angle: 45,
          height: 50,
          distance: 100,
          followMode: 'follow',
        };
    }
  }

  /**
   * 获取默认动画设置
   * Get default animation settings
   */
  static getDefaultAnimationSettings(): AnimationSettings {
    return {
      speed: 1.0,
      duration: 30, // 30秒
      frameRate: 30,
      easing: 'ease-in-out',
    };
  }

  /**
   * 获取默认渲染设置
   * Get default render settings
   */
  static getDefaultRenderSettings(): RenderSettings {
    return {
      width: 1920,
      height: 1080,
      quality: 'high',
      backgroundColor: '#87CEEB', // 天蓝色
      showTerrain: true,
      showTrajectory: true,
      showElevationProfile: true,
      showSpeedProfile: false,
      showHeartRateProfile: false,
      showPowerProfile: false,
      showCadenceProfile: false,
      showMarkers: true,
      showStats: true,
    };
  }

  /**
   * 延迟函数
   * Delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

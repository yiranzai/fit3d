/**
 * 3D运动追踪视频渲染器
 * 3D Motion Tracking Video Renderer
 */
import { TrajectoryData } from './trajectory-generator.js';
import { ActivityType } from '../types/index.js';
export interface CameraSettings {
    angle: number;
    height: number;
    distance: number;
    followMode: 'fixed' | 'follow' | 'orbit';
}
export interface AnimationSettings {
    speed: number;
    duration: number;
    frameRate: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
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
export declare class ThreeDRenderer {
    /**
     * 渲染3D运动追踪视频
     * Render 3D motion tracking video
     */
    static renderVideo(trajectoryData: TrajectoryData, cameraSettings: CameraSettings, animationSettings: AnimationSettings, renderSettings: RenderSettings): Promise<VideoRenderResult>;
    /**
     * 模拟3D场景创建
     * Simulate 3D scene creation
     */
    private static simulateSceneCreation;
    /**
     * 生成关键帧
     * Generate key frames
     */
    private static generateKeyFrames;
    /**
     * 计算相机位置
     * Calculate camera position
     */
    private static calculateCameraPosition;
    /**
     * 模拟视频渲染
     * Simulate video rendering
     */
    private static simulateVideoRendering;
    /**
     * 获取默认相机设置
     * Get default camera settings
     */
    static getDefaultCameraSettings(activityType: ActivityType): CameraSettings;
    /**
     * 获取默认动画设置
     * Get default animation settings
     */
    static getDefaultAnimationSettings(): AnimationSettings;
    /**
     * 获取默认渲染设置
     * Get default render settings
     */
    static getDefaultRenderSettings(): RenderSettings;
    /**
     * 延迟函数
     * Delay function
     */
    private static delay;
}
//# sourceMappingURL=3d-renderer.d.ts.map
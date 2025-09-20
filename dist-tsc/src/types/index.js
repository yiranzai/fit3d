/**
 * Fit3D 多样化地图样式系统 - 核心类型定义
 * Fit3D Diverse Map Styles System - Core Type Definitions
 */
// 错误代码枚举
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["PROVIDER_NOT_FOUND"] = "PROVIDER_NOT_FOUND";
    ErrorCode["STYLE_NOT_FOUND"] = "STYLE_NOT_FOUND";
    ErrorCode["TILE_NOT_FOUND"] = "TILE_NOT_FOUND";
    ErrorCode["INVALID_COORDINATES"] = "INVALID_COORDINATES";
    ErrorCode["CACHE_ERROR"] = "CACHE_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorCode || (ErrorCode = {}));
// 地图提供商状态
export var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["ACTIVE"] = "active";
    ProviderStatus["INACTIVE"] = "inactive";
    ProviderStatus["MAINTENANCE"] = "maintenance";
    ProviderStatus["ERROR"] = "error";
})(ProviderStatus || (ProviderStatus = {}));
// 缓存策略
export var CacheStrategy;
(function (CacheStrategy) {
    CacheStrategy["MEMORY"] = "memory";
    CacheStrategy["DISK"] = "disk";
    CacheStrategy["HYBRID"] = "hybrid";
})(CacheStrategy || (CacheStrategy = {}));
// 地图样式类型
export var MapStyleType;
(function (MapStyleType) {
    MapStyleType["TERRAIN"] = "terrain";
    MapStyleType["SATELLITE"] = "satellite";
    MapStyleType["STREET"] = "street";
    MapStyleType["TOPOGRAPHIC"] = "topographic";
    MapStyleType["HYBRID"] = "hybrid";
    MapStyleType["CUSTOM"] = "custom";
})(MapStyleType || (MapStyleType = {}));
// 活动类型
export var ActivityType;
(function (ActivityType) {
    ActivityType["HIKING"] = "hiking";
    ActivityType["CYCLING"] = "cycling";
    ActivityType["RUNNING"] = "running";
    ActivityType["MOUNTAIN_BIKING"] = "mountain_biking";
    ActivityType["CLIMBING"] = "climbing";
    ActivityType["LEISURE"] = "leisure";
})(ActivityType || (ActivityType = {}));
// 语言代码
export var LanguageCode;
(function (LanguageCode) {
    LanguageCode["ZH_CN"] = "zh-CN";
    LanguageCode["EN_US"] = "en-US";
})(LanguageCode || (LanguageCode = {}));
//# sourceMappingURL=index.js.map
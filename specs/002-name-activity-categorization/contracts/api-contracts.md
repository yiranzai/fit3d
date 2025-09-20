# API Contracts Specification

## Overview
This document defines the API contracts for the Fit3D outdoor sports data management application. All APIs follow RESTful principles and support both English and Chinese localization.

## Base URL and Versioning
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Accept-Language**: `en-US` or `zh-CN`

## Authentication
Currently, the application runs locally without authentication. Future versions may include user authentication for cloud sync features.

## Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    messageZh: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

## Activity Management APIs

### Import Activity
**POST** `/activities/import`

Import a FIT or GPX file and create a new activity record.

**Request:**
```typescript
interface ImportActivityRequest {
  file: File; // Multipart form data
  categoryId?: string; // Optional override
  name?: string; // Optional custom name
}
```

**Response:**
```typescript
interface ImportActivityResponse {
  activity: Activity;
  gpsPoints: GPSPoint[];
  metadata: Record<string, any>;
  processingTime: number; // milliseconds
}
```

**Error Codes:**
- `INVALID_FILE_FORMAT`: Unsupported file format
- `FILE_TOO_LARGE`: File exceeds size limit
- `PARSE_ERROR`: Error parsing file content
- `CATEGORY_NOT_FOUND`: Invalid category ID

### Get Activities
**GET** `/activities`

Retrieve a list of activities with optional filtering and pagination.

**Query Parameters:**
- `categoryId`: Filter by activity category
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `minDistance`: Minimum distance filter (meters)
- `maxDistance`: Maximum distance filter (meters)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (startTime, distance, duration)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```typescript
interface GetActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    minDistance?: number;
    maxDistance?: number;
  };
}
```

### Get Activity Details
**GET** `/activities/{id}`

Retrieve detailed information about a specific activity.

**Response:**
```typescript
interface GetActivityResponse {
  activity: Activity;
  gpsPoints: GPSPoint[];
  metadata: Record<string, any>;
  statistics: {
    totalDistance: number;
    totalDuration: number;
    averageSpeed: number;
    maxSpeed: number;
    elevationGain: number;
    maxElevation: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
  };
}
```

### Update Activity
**PUT** `/activities/{id}`

Update activity information and metadata.

**Request:**
```typescript
interface UpdateActivityRequest {
  name?: string;
  categoryId?: string;
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
interface UpdateActivityResponse {
  activity: Activity;
  updated: string[]; // List of updated fields
}
```

### Delete Activity
**DELETE** `/activities/{id}`

Delete an activity and all associated GPS points.

**Response:**
```typescript
interface DeleteActivityResponse {
  success: boolean;
  deletedId: string;
  deletedGpsPoints: number;
}
```

## Category Management APIs

### Get Categories
**GET** `/categories`

Retrieve all available activity categories.

**Response:**
```typescript
interface GetCategoriesResponse {
  categories: ActivityCategory[];
}
```

### Get Category Details
**GET** `/categories/{id}`

Retrieve detailed information about a specific category.

**Response:**
```typescript
interface GetCategoryResponse {
  category: ActivityCategory;
  metadataSchema: CategoryMetadataSchema[];
  visualizationConfigs: VisualizationConfig[];
  statistics: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    averageDistance: number;
    averageDuration: number;
  };
}
```

### Auto-categorize Activity
**POST** `/categories/auto-categorize`

Automatically determine the category for an activity based on GPS data and metadata.

**Request:**
```typescript
interface AutoCategorizeRequest {
  gpsPoints: GPSPoint[];
  metadata: Record<string, any>;
  fileType: 'fit' | 'gpx';
}
```

**Response:**
```typescript
interface AutoCategorizeResponse {
  categoryId: string;
  confidence: number; // 0-1
  reasoning: string;
  reasoningZh: string;
  alternativeCategories: {
    categoryId: string;
    confidence: number;
  }[];
}
```

## Visualization APIs

### Generate Map
**POST** `/visualizations/map`

Generate a map visualization for selected activities.

**Request:**
```typescript
interface GenerateMapRequest {
  activityIds: string[];
  config: {
    style: 'satellite' | 'terrain' | 'street' | 'dark';
    showElevation: boolean;
    showSpeed: boolean;
    showHeartRate: boolean;
    colorScheme: 'gradient' | 'solid' | 'heatmap';
    lineWidth: number;
    resolution: '720p' | '1080p' | '4k';
  };
}
```

**Response:**
```typescript
interface GenerateMapResponse {
  mapId: string;
  status: 'processing' | 'completed' | 'failed';
  outputPath?: string;
  estimatedTime?: number; // seconds
  progress?: number; // 0-100
}
```

### Generate 3D Video
**POST** `/visualizations/video`

Generate a 3D motion tracking video for selected activities.

**Request:**
```typescript
interface GenerateVideoRequest {
  activityIds: string[];
  config: {
    cameraAngle: number; // degrees
    cameraHeight: number; // meters
    playbackSpeed: number; // multiplier
    resolution: '720p' | '1080p' | '4k';
    frameRate: 24 | 30 | 60;
    imageInsertions: {
      timestamp: string; // ISO 8601
      imagePath: string;
      duration: number; // seconds
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    }[];
  };
}
```

**Response:**
```typescript
interface GenerateVideoResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  outputPath?: string;
  estimatedTime?: number; // seconds
  progress?: number; // 0-100
}
```

### Get Visualization Status
**GET** `/visualizations/{type}/{id}/status`

Check the status of a map or video generation.

**Response:**
```typescript
interface VisualizationStatusResponse {
  id: string;
  type: 'map' | 'video';
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  outputPath?: string;
  error?: string;
  errorZh?: string;
  createdAt: string;
  completedAt?: string;
}
```

## Analytics APIs

### Get Activity Statistics
**GET** `/analytics/statistics`

Retrieve comprehensive statistics for activities.

**Query Parameters:**
- `categoryId`: Filter by category
- `startDate`: Start date for statistics
- `endDate`: End date for statistics
- `groupBy`: Grouping period (day, week, month, year)

**Response:**
```typescript
interface StatisticsResponse {
  summary: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    totalElevationGain: number;
    averageDistance: number;
    averageDuration: number;
    averageSpeed: number;
  };
  byCategory: {
    [categoryId: string]: {
      totalActivities: number;
      totalDistance: number;
      totalDuration: number;
      averageDistance: number;
      averageDuration: number;
    };
  };
  timeSeries: {
    period: string;
    activities: number;
    distance: number;
    duration: number;
  }[];
}
```

### Get Performance Trends
**GET** `/analytics/trends`

Analyze performance trends over time.

**Query Parameters:**
- `categoryId`: Filter by category
- `metric`: Metric to analyze (distance, duration, speed, elevation)
- `period`: Analysis period (week, month, quarter, year)
- `startDate`: Start date for analysis

**Response:**
```typescript
interface TrendsResponse {
  metric: string;
  period: string;
  trends: {
    date: string;
    value: number;
    change: number; // Percentage change from previous period
  }[];
  summary: {
    trend: 'increasing' | 'decreasing' | 'stable';
    change: number; // Overall percentage change
    average: number;
    best: number;
    worst: number;
  };
}
```

## User Preferences APIs

### Get User Preferences
**GET** `/preferences`

Retrieve current user preferences.

**Response:**
```typescript
interface GetPreferencesResponse {
  preferences: UserPreferences;
}
```

### Update User Preferences
**PUT** `/preferences`

Update user preferences.

**Request:**
```typescript
interface UpdatePreferencesRequest {
  language?: string;
  theme?: 'light' | 'dark';
  defaultCategory?: string;
  autoCategorize?: boolean;
  dataDirectory?: string;
}
```

**Response:**
```typescript
interface UpdatePreferencesResponse {
  preferences: UserPreferences;
  updated: string[]; // List of updated fields
}
```

## File Management APIs

### Get File Information
**GET** `/files/{activityId}`

Get information about the original file for an activity.

**Response:**
```typescript
interface FileInfoResponse {
  activityId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: 'fit' | 'gpx';
  uploadDate: string;
  checksum: string;
}
```

### Export Activity Data
**GET** `/activities/{id}/export`

Export activity data in various formats.

**Query Parameters:**
- `format`: Export format (json, gpx, fit, csv)

**Response:**
```typescript
interface ExportResponse {
  format: string;
  data: string; // Base64 encoded data
  fileName: string;
  mimeType: string;
}
```

## WebSocket Events

### Real-time Updates
**WebSocket URL**: `ws://localhost:3000/ws`

**Events:**
```typescript
// Visualization progress updates
interface VisualizationProgressEvent {
  type: 'visualization.progress';
  data: {
    id: string;
    type: 'map' | 'video';
    progress: number;
    status: 'processing' | 'completed' | 'failed';
  };
}

// Activity import progress
interface ImportProgressEvent {
  type: 'import.progress';
  data: {
    activityId: string;
    progress: number;
    status: 'parsing' | 'categorizing' | 'completed' | 'failed';
  };
}

// System notifications
interface NotificationEvent {
  type: 'notification';
  data: {
    level: 'info' | 'warning' | 'error';
    message: string;
    messageZh: string;
    timestamp: string;
  };
}
```

## Rate Limiting
- **Import Operations**: 10 requests per minute
- **Visualization Generation**: 5 requests per minute
- **General API**: 100 requests per minute

## Response Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error

## Localization Support
All API responses include both English and Chinese text where applicable. The `Accept-Language` header determines the primary language, with fallback to English if Chinese is not available.

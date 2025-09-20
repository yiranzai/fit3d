# Data Model Specification

## Database Architecture

### Primary Database: SQLite
**Purpose:** Primary storage for application data, user preferences, and real-time operations
**Location:** Local file system (`~/.fit3d/data.db`)

### Analytical Database: DuckDB
**Purpose:** Complex analytical queries, reporting, and data processing
**Location:** Local file system (`~/.fit3d/analytics.db`)

## Core Data Models

### Activity Categories
```sql
-- SQLite Schema
CREATE TABLE activity_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  description TEXT,
  description_zh TEXT,
  icon TEXT,
  color TEXT, -- Hex color code
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial data
INSERT INTO activity_categories (id, name, name_zh, description, description_zh, icon, color) VALUES
('hiking', 'Hiking', '徒步爬山', 'Mountain hiking and trail walking activities', '山地徒步和步道行走活动', 'mountain', '#2E7D32'),
('cycling', 'Cycling', '骑行', 'Bicycle riding activities including road and mountain biking', '自行车骑行活动，包括公路骑行和山地骑行', 'bike', '#1976D2');
```

### Activities
```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES activity_categories(id),
  start_time DATETIME NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  distance REAL NOT NULL, -- meters
  elevation_gain REAL, -- meters
  max_elevation REAL, -- meters
  file_path TEXT,
  file_type TEXT NOT NULL, -- 'fit' or 'gpx'
  file_size INTEGER,
  metadata JSON, -- Category-specific metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_start_time ON activities(start_time);
CREATE INDEX idx_activities_duration ON activities(duration);
CREATE INDEX idx_activities_distance ON activities(distance);
```

### GPS Points
```sql
CREATE TABLE gps_points (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  elevation REAL,
  timestamp DATETIME NOT NULL,
  heart_rate INTEGER,
  cadence INTEGER,
  power INTEGER,
  temperature REAL,
  speed REAL, -- m/s
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for GPS queries
CREATE INDEX idx_gps_activity_timestamp ON gps_points(activity_id, timestamp);
CREATE INDEX idx_gps_coordinates ON gps_points(latitude, longitude);
```

### Category-Specific Metadata Schemas
```sql
CREATE TABLE category_metadata_schemas (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES activity_categories(id),
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'enum', 'array'
  field_options JSON, -- For enum and array types
  is_required BOOLEAN DEFAULT 0,
  display_name TEXT NOT NULL,
  display_name_zh TEXT NOT NULL,
  description TEXT,
  description_zh TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Hiking-specific metadata schema
INSERT INTO category_metadata_schemas (id, category_id, field_name, field_type, field_options, display_name, display_name_zh, description, description_zh) VALUES
('hiking_difficulty', 'hiking', 'trailDifficulty', 'enum', '["easy", "moderate", "hard", "expert"]', 'Trail Difficulty', '路线难度', 'Difficulty level of the hiking trail', '徒步路线难度等级'),
('hiking_trail_type', 'hiking', 'trailType', 'enum', '["loop", "out-and-back", "point-to-point"]', 'Trail Type', '路线类型', 'Type of hiking trail', '徒步路线类型'),
('hiking_surface', 'hiking', 'surfaceType', 'enum', '["dirt", "rock", "paved", "mixed"]', 'Surface Type', '路面类型', 'Surface type of the trail', '路线路面类型'),
('hiking_weather', 'hiking', 'weatherConditions', 'string', NULL, 'Weather Conditions', '天气条件', 'Weather conditions during the hike', '徒步时的天气条件'),
('hiking_gear', 'hiking', 'gearUsed', 'array', NULL, 'Gear Used', '使用装备', 'Equipment and gear used during the hike', '徒步时使用的装备'),
('hiking_companions', 'hiking', 'companions', 'number', NULL, 'Number of Companions', '同行人数', 'Number of people who joined the hike', '参与徒步的人数');

-- Cycling-specific metadata schema
INSERT INTO category_metadata_schemas (id, category_id, field_name, field_type, field_options, display_name, display_name_zh, description, description_zh) VALUES
('cycling_bike_type', 'cycling', 'bikeType', 'enum', '["road", "mountain", "hybrid", "electric"]', 'Bike Type', '自行车类型', 'Type of bicycle used', '使用的自行车类型'),
('cycling_route_type', 'cycling', 'routeType', 'enum', '["commute", "recreational", "training", "race"]', 'Route Type', '路线类型', 'Type of cycling route', '骑行路线类型'),
('cycling_road_conditions', 'cycling', 'roadConditions', 'enum', '["smooth", "rough", "mixed"]', 'Road Conditions', '路况', 'Condition of the road surface', '路面状况'),
('cycling_traffic', 'cycling', 'trafficLevel', 'enum', '["low", "medium", "high"]', 'Traffic Level', '交通状况', 'Level of traffic encountered', '遇到的交通状况'),
('cycling_weather', 'cycling', 'weatherConditions', 'string', NULL, 'Weather Conditions', '天气条件', 'Weather conditions during the ride', '骑行时的天气条件');
```

### Visualization Configurations
```sql
CREATE TABLE visualization_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  type TEXT NOT NULL, -- 'map' or 'video'
  category_id TEXT REFERENCES activity_categories(id),
  config JSON NOT NULL,
  is_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default map configurations
INSERT INTO visualization_configs (id, name, name_zh, type, category_id, config, is_default) VALUES
('hiking_terrain_map', 'Hiking Terrain Map', '徒步地形图', 'map', 'hiking', '{"baseMap": "terrain", "showElevation": true, "showSpeed": false, "colorScheme": "elevation", "lineWidth": 3}', 1),
('cycling_road_map', 'Cycling Road Map', '骑行路线图', 'map', 'cycling', '{"baseMap": "street", "showElevation": false, "showSpeed": true, "colorScheme": "speed", "lineWidth": 2}', 1);

-- Default video configurations
INSERT INTO visualization_configs (id, name, name_zh, type, category_id, config, is_default) VALUES
('hiking_3d_video', 'Hiking 3D Video', '徒步3D视频', 'video', 'hiking', '{"cameraAngle": 45, "cameraHeight": 100, "playbackSpeed": 2, "resolution": "1080p", "frameRate": 30}', 1),
('cycling_3d_video', 'Cycling 3D Video', '骑行3D视频', 'video', 'cycling', '{"cameraAngle": 30, "cameraHeight": 50, "playbackSpeed": 4, "resolution": "1080p", "frameRate": 30}', 1);
```

### User Preferences
```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSON NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default preferences
INSERT INTO user_preferences (id, key, value) VALUES
('language', 'language', '"zh-CN"'),
('theme', 'theme', '"light"'),
('default_category', 'defaultCategory', '"hiking"'),
('auto_categorize', 'autoCategorize', 'true'),
('data_directory', 'dataDirectory', '"./data"');
```

## DuckDB Analytical Schema

### Activity Analytics
```sql
-- DuckDB Schema for analytical queries
CREATE TABLE activity_analytics AS
SELECT 
  a.id,
  a.name,
  a.category_id,
  a.start_time,
  a.duration,
  a.distance,
  a.elevation_gain,
  a.max_elevation,
  ac.name as category_name,
  ac.name_zh as category_name_zh,
  -- Calculated metrics
  a.distance / (a.duration / 3600.0) as avg_speed_kmh,
  a.elevation_gain / a.distance * 1000 as elevation_per_km,
  -- Time-based metrics
  EXTRACT(year FROM a.start_time) as year,
  EXTRACT(month FROM a.start_time) as month,
  EXTRACT(dayofweek FROM a.start_time) as day_of_week,
  -- GPS statistics
  COUNT(gp.id) as gps_point_count,
  AVG(gp.heart_rate) as avg_heart_rate,
  MAX(gp.heart_rate) as max_heart_rate,
  AVG(gp.speed) as avg_speed_ms,
  MAX(gp.speed) as max_speed_ms
FROM activities a
LEFT JOIN activity_categories ac ON a.category_id = ac.id
LEFT JOIN gps_points gp ON a.id = gp.activity_id
GROUP BY a.id, a.name, a.category_id, a.start_time, a.duration, a.distance, a.elevation_gain, a.max_elevation, ac.name, ac.name_zh;
```

### Performance Metrics
```sql
CREATE TABLE performance_metrics AS
SELECT 
  category_id,
  COUNT(*) as total_activities,
  SUM(duration) as total_duration,
  SUM(distance) as total_distance,
  SUM(elevation_gain) as total_elevation_gain,
  AVG(distance / (duration / 3600.0)) as avg_speed_kmh,
  AVG(elevation_gain / distance * 1000) as avg_elevation_per_km,
  MIN(start_time) as first_activity,
  MAX(start_time) as last_activity
FROM activities
GROUP BY category_id;
```

## TypeScript Interfaces

### Core Data Types
```typescript
interface Activity {
  id: string;
  name: string;
  categoryId: string;
  startTime: Date;
  duration: number; // seconds
  distance: number; // meters
  elevationGain?: number; // meters
  maxElevation?: number; // meters
  filePath?: string;
  fileType: 'fit' | 'gpx';
  fileSize?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface GPSPoint {
  id: string;
  activityId: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timestamp: Date;
  heartRate?: number;
  cadence?: number;
  power?: number;
  temperature?: number;
  speed?: number; // m/s
  createdAt: Date;
}

interface ActivityCategory {
  id: string;
  name: string;
  nameZh: string;
  description?: string;
  descriptionZh?: string;
  icon?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryMetadataSchema {
  id: string;
  categoryId: string;
  fieldName: string;
  fieldType: 'string' | 'number' | 'boolean' | 'enum' | 'array';
  fieldOptions?: any[];
  isRequired: boolean;
  displayName: string;
  displayNameZh: string;
  description?: string;
  descriptionZh?: string;
  sortOrder: number;
}

interface VisualizationConfig {
  id: string;
  name: string;
  nameZh: string;
  type: 'map' | 'video';
  categoryId?: string;
  config: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
}

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  defaultCategory: string;
  autoCategorize: boolean;
  dataDirectory: string;
}
```

### Category-Specific Metadata Types
```typescript
interface HikingMetadata {
  trailDifficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  trailType?: 'loop' | 'out-and-back' | 'point-to-point';
  surfaceType?: 'dirt' | 'rock' | 'paved' | 'mixed';
  weatherConditions?: string;
  gearUsed?: string[];
  companions?: number;
}

interface CyclingMetadata {
  bikeType?: 'road' | 'mountain' | 'hybrid' | 'electric';
  routeType?: 'commute' | 'recreational' | 'training' | 'race';
  roadConditions?: 'smooth' | 'rough' | 'mixed';
  trafficLevel?: 'low' | 'medium' | 'high';
  weatherConditions?: string;
}
```

## Data Synchronization Strategy

### SQLite to DuckDB Sync
```typescript
interface SyncStrategy {
  // Incremental sync for new activities
  syncNewActivities(): Promise<void>;
  
  // Full sync for analytical data
  syncAnalyticalData(): Promise<void>;
  
  // Sync user preferences
  syncUserPreferences(): Promise<void>;
  
  // Cleanup old data
  cleanupOldData(): Promise<void>;
}
```

### Data Migration
```typescript
interface MigrationStrategy {
  // Version-based migrations
  migrateToVersion(version: string): Promise<void>;
  
  // Backup before migration
  createBackup(): Promise<string>;
  
  // Rollback migration
  rollbackMigration(backupPath: string): Promise<void>;
}
```

## Performance Optimization

### Indexing Strategy
- **Primary Indexes**: Activity ID, Category ID, Start Time
- **Composite Indexes**: Category + Start Time, Category + Distance
- **Spatial Indexes**: GPS coordinates for location-based queries
- **Full-text Indexes**: Activity names and descriptions

### Query Optimization
- **Prepared Statements**: For frequently used queries
- **Connection Pooling**: Efficient database connections
- **Query Caching**: Cache frequently accessed data
- **Lazy Loading**: Load data on demand

### Data Archiving
- **Old Data Archiving**: Move old activities to archive tables
- **Compression**: Compress GPS data for storage efficiency
- **Partitioning**: Partition large tables by date ranges
- **Cleanup**: Regular cleanup of temporary data

# Technical Specification

## Constitution Compliance
This specification MUST adhere to constitutional principles:
- **Free and Open Source:** All components use open source technologies
- **Code Quality Excellence:** Architecture follows established patterns
- **Comprehensive Testing:** All features include test specifications
- **User Experience Consistency:** UI/UX follows design system
- **Performance Requirements:** Meets established performance benchmarks
- **Chinese Language Support:** Chinese localization requirements are specified

## Feature Specification

### Feature Name
Activity Categorization System

### Overview
A flexible and extensible activity categorization system that initially supports hiking and cycling activities, with a designed architecture to easily accommodate additional activity types in the future. The system provides activity-specific metadata, visualization options, and analysis capabilities tailored to each category.

### User Stories
- As a hiker, I want my hiking activities to be automatically categorized so that I can track my mountain climbing progress and statistics
- As a cyclist, I want my cycling activities to be categorized separately so that I can analyze my cycling performance and routes
- As a data analyst, I want to filter activities by category so that I can generate category-specific reports and insights
- As a future user, I want the system to support new activity types so that I can track different sports as they are added
- As a Chinese user, I want activity categories displayed in Chinese so that I can easily understand and navigate the system

### Acceptance Criteria
- [ ] System automatically detects and categorizes hiking activities from FIT/GPX files
- [ ] System automatically detects and categorizes cycling activities from FIT/GPX files
- [ ] Users can manually override automatic categorization
- [ ] Each activity category has specific metadata fields and analysis options
- [ ] Category-specific visualization styles are available for maps and 3D videos
- [ ] System architecture supports easy addition of new activity types
- [ ] All category names and descriptions support Chinese localization
- [ ] Performance remains optimal with category-based filtering and queries

### Technical Requirements

#### API Specifications
```typescript
enum ActivityCategory {
  HIKING = 'hiking',
  CYCLING = 'cycling',
  RUNNING = 'running', // Future
  SWIMMING = 'swimming', // Future
  SKIING = 'skiing' // Future
}

interface ActivityCategoryConfig {
  id: ActivityCategory;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  color: string;
  defaultMetrics: string[];
  visualizationOptions: VisualizationOptions;
  analysisFeatures: AnalysisFeature[];
  metadataSchema: Record<string, any>;
}

interface VisualizationOptions {
  mapStyles: MapStyle[];
  videoStyles: VideoStyle[];
  colorSchemes: ColorScheme[];
  defaultSettings: VisualizationSettings;
}

interface MapStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  baseMap: 'terrain' | 'satellite' | 'street' | 'topographic';
  overlayOptions: OverlayOption[];
}

interface VideoStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  cameraPresets: CameraPreset[];
  effects: VideoEffect[];
}

interface AnalysisFeature {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  metrics: string[];
  visualizations: string[];
}

interface HikingMetadata {
  trailDifficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  elevationGain: number;
  maxElevation: number;
  trailType: 'loop' | 'out-and-back' | 'point-to-point';
  surfaceType: 'dirt' | 'rock' | 'paved' | 'mixed';
  weatherConditions?: string;
  gearUsed?: string[];
  companions?: number;
}

interface CyclingMetadata {
  bikeType: 'road' | 'mountain' | 'hybrid' | 'electric';
  averageSpeed: number;
  maxSpeed: number;
  cadence?: number;
  power?: number;
  routeType: 'commute' | 'recreational' | 'training' | 'race';
  roadConditions: 'smooth' | 'rough' | 'mixed';
  trafficLevel: 'low' | 'medium' | 'high';
  weatherConditions?: string;
}
```

#### Database Schema
```sql
-- Activity categories configuration
CREATE TABLE activity_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100) NOT NULL,
  description TEXT,
  description_zh TEXT,
  icon VARCHAR(100),
  color VARCHAR(7), -- Hex color code
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category-specific metadata schemas
CREATE TABLE category_metadata_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR(50) REFERENCES activity_categories(id),
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'enum', 'array'
  field_options JSON, -- For enum and array types
  is_required BOOLEAN DEFAULT false,
  display_name VARCHAR(100) NOT NULL,
  display_name_zh VARCHAR(100) NOT NULL,
  description TEXT,
  description_zh TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Update activities table to include category
ALTER TABLE activities ADD COLUMN category_id VARCHAR(50) REFERENCES activity_categories(id);
ALTER TABLE activities ADD COLUMN category_metadata JSON;

-- Category-specific visualization options
CREATE TABLE category_visualization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR(50) REFERENCES activity_categories(id),
  option_type VARCHAR(50) NOT NULL, -- 'map_style', 'video_style', 'color_scheme'
  option_config JSON NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Category-specific analysis features
CREATE TABLE category_analysis_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR(50) REFERENCES activity_categories(id),
  feature_name VARCHAR(100) NOT NULL,
  feature_name_zh VARCHAR(100) NOT NULL,
  description TEXT,
  description_zh TEXT,
  metrics JSON NOT NULL, -- Array of metric names
  visualizations JSON NOT NULL, -- Array of visualization types
  is_enabled BOOLEAN DEFAULT true
);

-- Insert initial categories
INSERT INTO activity_categories (id, name, name_zh, description, description_zh, icon, color) VALUES
('hiking', 'Hiking', '徒步爬山', 'Mountain hiking and trail walking activities', '山地徒步和步道行走活动', 'mountain', '#2E7D32'),
('cycling', 'Cycling', '骑行', 'Bicycle riding activities including road and mountain biking', '自行车骑行活动，包括公路骑行和山地骑行', 'bike', '#1976D2');
```

#### Component Architecture
- **Category Detection Service**: Automatically categorizes activities based on file metadata and GPS patterns
- **Category Configuration Manager**: Manages category definitions, metadata schemas, and visualization options
- **Category-Specific Analyzers**: Provides category-tailored analysis and statistics
- **Visualization Engine**: Renders category-specific map styles and video effects
- **Metadata Validator**: Ensures category-specific metadata follows defined schemas
- **Localization Service**: Handles category names and descriptions in multiple languages
- **Category Extension Framework**: Provides APIs for adding new activity categories

### Testing Requirements

#### Unit Tests
- [ ] Category detection correctly identifies hiking activities from GPS patterns
- [ ] Category detection correctly identifies cycling activities from speed and cadence data
- [ ] Metadata validation enforces category-specific schema requirements
- [ ] Visualization options are correctly applied based on activity category
- [ ] Localization service returns correct Chinese category names
- [ ] Category configuration manager handles CRUD operations correctly

#### Integration Tests
- [ ] End-to-end activity import with automatic categorization
- [ ] Category-specific map generation with appropriate styles
- [ ] Category-specific 3D video generation with tailored effects
- [ ] Category filtering and search functionality
- [ ] Metadata extraction and validation for different activity types

#### E2E Tests
- [ ] Complete workflow: import hiking activity → auto-categorize → generate hiking-specific map
- [ ] Complete workflow: import cycling activity → auto-categorize → generate cycling-specific video
- [ ] Category switching and manual override functionality
- [ ] Category-specific analysis and reporting features

### Performance Requirements
- Response Time: < 100ms for category detection, < 200ms for category-based queries
- Throughput: Support 1000+ activities per category without performance degradation
- Memory Usage: < 50MB for category configuration and detection algorithms
- CPU Usage: < 10% for automatic categorization during import
- Storage: Efficient indexing for category-based filtering and search

### Security Considerations
- Input validation for category metadata to prevent injection attacks
- Access control for category configuration management
- Data integrity checks for category-specific metadata
- Secure storage of category configuration and user preferences

### Accessibility Requirements
- WCAG 2.1 AA compliance for category selection interfaces
- Keyboard navigation support for category filtering
- Screen reader compatibility for category names and descriptions
- Color contrast requirements for category-specific color schemes
- Clear visual indicators for different activity categories

### Chinese Localization Requirements
- Simplified Chinese (zh-CN) support for all category names and descriptions
- Chinese input method compatibility for category search and filtering
- Chinese date/time formatting for category-specific statistics
- Chinese error messages for category-related operations
- Chinese documentation for category features and usage

### Error Handling
- **Detection Failures**: Fallback to manual categorization when automatic detection fails
- **Invalid Metadata**: Clear error messages for category-specific metadata validation
- **Missing Categories**: Graceful handling of activities with unknown categories
- **Configuration Errors**: Validation and rollback for category configuration changes
- **Localization Errors**: Fallback to English when Chinese translations are missing

### Dependencies
- **Core**: Node.js 18+, TypeScript 5.0+
- **Database**: PostgreSQL 14+ with JSON support
- **Validation**: Joi or Zod for schema validation
- **Localization**: i18next with Chinese language pack
- **Visualization**: Mapbox GL JS, Three.js for category-specific rendering
- **Testing**: Jest, Cypress for comprehensive test coverage

### Implementation Notes
- **Phase 1**: Implement hiking and cycling categories with basic detection
- **Phase 2**: Add category-specific visualization options and analysis features
- **Phase 3**: Build extensible framework for adding new activity types
- Use plugin architecture for category-specific functionality
- Implement caching for category configurations and detection algorithms
- Consider machine learning for improved automatic categorization accuracy
- Design API for third-party category extensions

### Definition of Done
- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing (90% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Documentation updated in Chinese and English
- [ ] Accessibility requirements met
- [ ] Security review completed
- [ ] Chinese localization implemented and tested
- [ ] Hiking and cycling categories fully functional
- [ ] Extensible architecture documented for future categories
- [ ] Category-specific visualizations working correctly

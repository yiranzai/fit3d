declare module 'fit-file-parser' {
  interface FitParserOptions {
    force?: boolean;
    speedUnit?: string;
    lengthUnit?: string;
    temperatureUnit?: string;
    elapsedRecordField?: boolean;
    mode?: string;
  }

  interface FitRecord {
    timestamp?: string;
    position_lat?: number;
    position_long?: number;
    altitude?: number;
    heart_rate?: number;
    cadence?: number;
    speed?: number;
    power?: number;
    temperature?: number;
  }

  interface FitSession {
    start_time?: string;
    end_time?: string;
    total_elapsed_time?: number;
    total_distance?: number;
    total_calories?: number;
    avg_heart_rate?: number;
    max_heart_rate?: number;
    avg_speed?: number;
    max_speed?: number;
    avg_cadence?: number;
    max_cadence?: number;
    avg_power?: number;
    max_power?: number;
    total_ascent?: number;
    total_descent?: number;
    min_altitude?: number;
    max_altitude?: number;
  }

  interface FitFileId {
    type?: string;
    manufacturer?: string;
    product?: string;
    serial_number?: string;
    time_created?: string;
  }

  interface FitData {
    file_id?: FitFileId;
    sessions?: FitSession[];
    records?: FitRecord[];
  }

  class FitParser {
    constructor(options?: FitParserOptions);
    parse(buffer: Buffer, callback: (error: any, data: FitData) => void): void;
  }

  const FitParser: {
    new (options?: FitParserOptions): FitParser;
  };
  
  export = FitParser;
}

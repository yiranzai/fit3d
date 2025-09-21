declare module '@garmin/fitsdk' {
  export interface FitMessage {
    name: string;
    fields: Record<string, any>;
  }

  export interface FitParseResult {
    messages: FitMessage[];
    errors: any[];
  }

  export class Stream {
    static fromBuffer(buffer: Buffer): Stream;
  }

  export class Decoder {
    constructor(stream: Stream);
    read(options: { mesgListener: (mesgNum: number, message: any) => void }): FitParseResult;
  }

  export class Profile {
    // Add profile definitions as needed
  }
}

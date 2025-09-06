import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Response for Node.js test environment
global.Response = class Response {
  constructor(body?: any, init?: any) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  body: any;
  status: number;
  statusText: string;
  ok: boolean;
  
  static isResponse(value: any): boolean {
    return value instanceof Response;
  }
};

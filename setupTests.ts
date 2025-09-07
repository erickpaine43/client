// Setup for Jest testing environment
// This file is only loaded during testing and not during production builds

// Mock Response for tests
if (typeof global.Response === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Response = class Response {
    constructor(body?: unknown, init?: { status?: number; statusText?: string; headers?: Record<string, string> }) {
      this.body = body;
      this.status = (init && init.status) || 200;
      this.statusText = (init && init.statusText) || 'OK';
      this.headers = (init && init.headers) || {};
      this.ok = this.status >= 200 && this.status < 300;
    }
    body: unknown;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    ok: boolean;

    // Common methods
    text() {
      return Promise.resolve(this.body || '');
    }

    json() {
      return Promise.resolve(this.body || {});
    }
  };

  // Static methods if needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Response.json = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Response.error = jest.fn();
}

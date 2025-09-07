// Set up global test environment
// Add basic globals to jsdom environment if not available
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = (init && init.status) || 200;
      this.statusText = (init && init.statusText) || 'OK';
      this.headers = (init && init.headers) || {};
      this.ok = this.status >= 200 && this.status < 300;
    }
  };
}

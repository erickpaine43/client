import { describe, test, expect } from '@jest/globals';

describe('GET /api/tenants Contract Test', () => {
  test('should return tenant information', async () => {
    const response = await fetch('http://localhost:3000/api/tenants', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('slug');
    // This test will fail initially since the endpoint is not implemented
  });
});

import { describe, test, expect } from '@jest/globals';

describe('GET /api/companies Contract Test', () => {
  test('should return list of companies', async () => {
    const response = await fetch('http://localhost:3000/api/companies', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json() as Array<{ id: string; name: string; tenant_id: string }>;
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('tenant_id');
    }
    // This test will fail initially since the endpoint is not implemented
  });
});

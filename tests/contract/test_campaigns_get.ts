import { describe, test, expect } from '@jest/globals';

describe('GET /api/campaigns Contract Test', () => {
  test('should return list of campaigns', async () => {
    const response = await fetch('http://localhost:3000/api/campaigns', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json() as Array<{ id: string; name: string; company_id: string; status: string }>;
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('company_id');
      expect(data[0]).toHaveProperty('status');
    }
    // This test will fail initially since the endpoint is not implemented
  });
});

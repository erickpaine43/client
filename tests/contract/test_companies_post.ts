import { describe, test, expect } from '@jest/globals';

describe('POST /api/companies Contract Test', () => {
  test('should create new company', async () => {
    const response = await fetch('http://localhost:3000/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        name: 'Test Company',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('tenant_id');
    // This test will fail initially since the endpoint is not implemented
  });
});

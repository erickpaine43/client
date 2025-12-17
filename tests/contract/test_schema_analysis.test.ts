import contract from '../../specs/005-i-need-you/contracts/schema-analysis.json';

describe('Schema Analysis Contract Test', () => {
  test('contract should have steps', () => {
    expect(contract.steps).toBeDefined();
    expect(contract.steps.length).toBeGreaterThan(0);
    // This will fail initially since implementation is not done
    expect(contract.steps[0].name).toBe('implemented');
  });
});

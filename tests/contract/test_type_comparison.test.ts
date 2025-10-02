import contract from '../../specs/005-i-need-you/contracts/type-comparison.json';

describe('Type Comparison Contract Test', () => {
  test('contract should have steps', () => {
    expect(contract.steps).toBeDefined();
    expect(contract.steps.length).toBeGreaterThan(0);
    // This will fail initially since implementation is not done
    expect(contract.steps[0].name).toBe('implemented');
  });
});

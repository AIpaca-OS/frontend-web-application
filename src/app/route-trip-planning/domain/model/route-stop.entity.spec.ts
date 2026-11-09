import { describe, it, expect } from 'vitest';

import {
  isValidStopAddress,
  normalizeRouteStops,
  normalizeStopAddress
} from './route-stop.entity';

describe('RouteStop', () => {

  it('should validate addresses', () => {
    expect(isValidStopAddress('')).toBe(false);
    expect(isValidStopAddress('Av. Venezuela 123')).toBe(true);
    expect(isValidStopAddress('A'.repeat(351))).toBe(false);
  });

  it('should normalize whitespace', () => {
    expect(
      normalizeStopAddress('  Av.   Venezuela 123  ')
    ).toBe('Av. Venezuela 123');
  });

  it('should preserve stop identifiers and order', () => {
    const stops = normalizeRouteStops([
      {
        id: 'stop-002',
        address: 'Av. Faucett 200'
      },
      {
        id: 'stop-001',
        address: 'Av. Venezuela 100'
      }
    ]);

    expect(stops).toHaveLength(2);
    expect(stops[0].id).toBe('stop-002');
    expect(stops[0].position).toBe(1);
    expect(stops[1].id).toBe('stop-001');
    expect(stops[1].position).toBe(2);
  });

});

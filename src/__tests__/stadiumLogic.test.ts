import { Section } from '../types';

// stadiumLogic.test.ts
const getOccupancyStatus = (pct: number) => {
  if (pct >= 85) return 'critical';
  if (pct >= 65) return 'busy';
  return 'clear';
};

const getWaitColor = (waitMin: number) => {
  if (waitMin >= 15) return 'red';
  if (waitMin >= 5) return 'amber';
  return 'green';
};

const getBestGate = (sections: any[]) => {
  const safe = sections.filter(s => getOccupancyStatus(s.occupancyPct) !== 'critical');
  if (safe.length === 0) return null;

  return safe.sort((a, b) => (a.waitMin || 0) - (b.waitMin || 0))[0]?.gate || null;
};

const calcOccupancyPct = (current: number, capacity: number) => {
  if (capacity === 0) return 0;
  return Math.round((current / capacity) * 100);
};

const estimateQueueWait = (queueLength: number) => {
  if (queueLength < 0) return 0;
  return queueLength * 0.5;
};

describe('Stadium Logic Utilities', () => {
  describe('getOccupancyStatus', () => {
    it('returns "clear" for low occupancy', () => {
      expect(getOccupancyStatus(50)).toBe('clear');
    });
    it('returns "busy" for medium occupancy', () => {
      expect(getOccupancyStatus(75)).toBe('busy');
    });
    it('returns "critical" for high occupancy', () => {
      expect(getOccupancyStatus(90)).toBe('critical');
    });
    it('handles exactly the threshold 85%', () => {
      expect(getOccupancyStatus(85)).toBe('critical');
    });
  });

  describe('getWaitColor', () => {
    it('returns "green" for short waits', () => {
      expect(getWaitColor(3)).toBe('green');
    });
    it('returns "amber" for medium waits', () => {
      expect(getWaitColor(10)).toBe('amber');
    });
    it('returns "red" for long waits', () => {
      expect(getWaitColor(20)).toBe('red');
    });
    it('handles exactly the threshold 15 mins', () => {
      expect(getWaitColor(15)).toBe('red');
    });
  });

  describe('getBestGate', () => {
    it('returns the gate with the lowest wait that is not critical', () => {
      const sections = [
        { gate: 'Gate A', occupancyPct: 90, waitMin: 2 },
        { gate: 'Gate B', occupancyPct: 70, waitMin: 10 },
        { gate: 'Gate C', occupancyPct: 50, waitMin: 5 },
      ];
      expect(getBestGate(sections)).toBe('Gate C');
    });
    it('returns null if all gates are critical', () => {
      const sections = [
        { gate: 'Gate A', occupancyPct: 90, waitMin: 2 },
        { gate: 'Gate B', occupancyPct: 85, waitMin: 1 },
      ];
      expect(getBestGate(sections)).toBe(null);
    });
    it('returns null for an empty array', () => {
      expect(getBestGate([])).toBe(null);
    });
  });

  describe('calcOccupancyPct', () => {
    it('calculates the correct percentage', () => {
      expect(calcOccupancyPct(50, 100)).toBe(50);
    });
    it('rounds to the nearest integer', () => {
      expect(calcOccupancyPct(33, 100)).toBe(33);
      expect(calcOccupancyPct(6, 9)).toBe(67);
    });
    it('returns 0 if capacity is 0 to avoid Infinity', () => {
      expect(calcOccupancyPct(10, 0)).toBe(0);
    });
    it('returns 0 if current occupancy is 0', () => {
      expect(calcOccupancyPct(0, 100)).toBe(0);
    });
  });

  describe('estimateQueueWait', () => {
    it('returns 0.5 min per person', () => {
      expect(estimateQueueWait(10)).toBe(5);
    });
    it('handles 0 people in queue', () => {
      expect(estimateQueueWait(0)).toBe(0);
    });
    it('handles large numbers people', () => {
      expect(estimateQueueWait(100)).toBe(50);
    });
    it('handles negative inputs fallback', () => {
      expect(estimateQueueWait(-5)).toBe(0);
    });
  });
});

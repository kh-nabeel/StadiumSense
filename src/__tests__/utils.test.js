// /src/__tests__/utils.test.js

// 1. Occupancy Percentage Calculation
function calculateOccupancyPercentage(current, capacity) {
  if (!capacity || capacity <= 0) return 0;
  return Math.round((current / capacity) * 100);
}

// 2. Wait Time Color Logic
function getWaitTimeColor(minutes) {
  if (minutes < 10) return 'green';
  if (minutes < 20) return 'amber';
  return 'red';
}

// 3. Gate Suggestion Function
function suggestGate(sections) {
  if (!sections || sections.length === 0) return null;
  const available = sections.filter(s => (s.occupancyPct || 0) < 80);
  if (available.length === 0) {
    return sections[0].gateNumber || sections[0].id; // Fallback
  }
  return available.sort((a, b) => (a.occupancyPct || 0) - (b.occupancyPct || 0))[0].gateNumber || available[0].id;
}

describe('Utils Functions', () => {
  describe('calculateOccupancyPercentage', () => {
    it('properly calculates and rounds percentage', () => {
      expect(calculateOccupancyPercentage(10, 100)).toBe(10);
      expect(calculateOccupancyPercentage(333, 1000)).toBe(33);
    });

    it('returns 0 if capacity is invalid or 0', () => {
      expect(calculateOccupancyPercentage(50, 0)).toBe(0);
      expect(calculateOccupancyPercentage(50, null)).toBe(0);
    });
  });

  describe('getWaitTimeColor', () => {
    it('returns green for wait times under 10 minutes', () => {
      expect(getWaitTimeColor(5)).toBe('green');
      expect(getWaitTimeColor(9)).toBe('green');
    });

    it('returns amber for wait times between 10 and 19 minutes', () => {
      expect(getWaitTimeColor(10)).toBe('amber');
      expect(getWaitTimeColor(15)).toBe('amber');
    });

    it('returns red for wait times 20 minutes or longer', () => {
      expect(getWaitTimeColor(20)).toBe('red');
      expect(getWaitTimeColor(45)).toBe('red');
    });
  });

  describe('suggestGate', () => {
    it('suggests the gate with the lowest occupancy that is under 80%', () => {
      const sections = [
        { id: '1', gateNumber: 'Gate A', occupancyPct: 85 },
        { id: '2', gateNumber: 'Gate B', occupancyPct: 50 },
        { id: '3', gateNumber: 'Gate C', occupancyPct: 30 }
      ];
      expect(suggestGate(sections)).toBe('Gate C');
    });

    it('falls back to the first available gate if all sections are >= 80% occupancy', () => {
      const sections = [
        { id: '1', gateNumber: 'Gate A', occupancyPct: 85 },
        { id: '2', gateNumber: 'Gate B', occupancyPct: 90 },
      ];
      expect(suggestGate(sections)).toBe('Gate A');
    });

    it('returns null if sections is empty or undefined', () => {
      expect(suggestGate([])).toBeNull();
      expect(suggestGate(null)).toBeNull();
    });
  });
});

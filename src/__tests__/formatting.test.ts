// formatting.test.ts
const formatWaitTime = (min: number) => min === 0 ? 'No wait' : `~${min} min`;
const formatOccupancy = (current: number, capacity: number) => `${current.toLocaleString('en-US')} / ${capacity.toLocaleString('en-US')}`;
const formatGateName = (gate: string) => {
  if (!gate) return '';
  return gate.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

describe('Formatting Utilities', () => {
  describe('formatWaitTime', () => {
    it('returns "No wait" when min is 0', () => {
      expect(formatWaitTime(0)).toBe('No wait');
    });
    it('returns "~X min" for positive minutes', () => {
      expect(formatWaitTime(5)).toBe('~5 min');
    });
    it('handles large numbers', () => {
      expect(formatWaitTime(120)).toBe('~120 min');
    });
    it('handles negative numbers safely', () => {
      // Depending on requirement, we'll just evaluate its raw behavior
      expect(formatWaitTime(-5)).toBe('~-5 min');
    });
  });

  describe('formatOccupancy', () => {
    it('formats occupancy appropriately without commas for small numbers', () => {
      expect(formatOccupancy(500, 900)).toBe('500 / 900');
    });
    it('formats occupancy with commas for large numbers', () => {
      expect(formatOccupancy(8740, 9200)).toBe('8,740 / 9,200');
      expect(formatOccupancy(100000, 150000)).toBe('100,000 / 150,000');
    });
    it('handles 0 current occupancy', () => {
      expect(formatOccupancy(0, 1000)).toBe('0 / 1,000');
    });
    it('handles equal current and capacity', () => {
      expect(formatOccupancy(1500, 1500)).toBe('1,500 / 1,500');
    });
  });

  describe('formatGateName', () => {
    it('capitalizes standard gate names', () => {
      expect(formatGateName('gate a')).toBe('Gate A');
      expect(formatGateName('north gate')).toBe('North Gate');
    });
    it('handles single word inputs', () => {
      expect(formatGateName('main')).toBe('Main');
    });
    it('handles all caps conversion correctly', () => {
      expect(formatGateName('NORTH GATE')).toBe('North Gate');
    });
    it('handles empty strings', () => {
      expect(formatGateName('')).toBe('');
    });
  });
});

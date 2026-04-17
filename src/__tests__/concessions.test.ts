import { Concession } from '../types';

// concessions.test.ts
const getOpenStalls = (concessions: Partial<Concession>[]) => concessions.filter(c => c.isOpen === true);
const sortByWaitTime = (concessions: Partial<Concession>[] | any[]) => [...concessions].sort((a, b) => a.waitTime - b.waitTime);
const getPreOrderEligible = (concessions: Partial<Concession>[]) => concessions.filter(c => c.preOrderEnabled === true);

describe('Concessions Utilities', () => {
  describe('getOpenStalls', () => {
    it('returns only open stalls', () => {
      const input = [{ name: 'A', isOpen: true }, { name: 'B', isOpen: false }];
      expect(getOpenStalls(input)).toEqual([{ name: 'A', isOpen: true }]);
    });
    it('returns empty array if no open stalls', () => {
      const input = [{ name: 'A', isOpen: false }];
      expect(getOpenStalls(input)).toEqual([]);
    });
    it('handles missing isOpen field', () => {
      const input = [{ name: 'A' }, { name: 'B', isOpen: true }];
      expect(getOpenStalls(input)).toEqual([{ name: 'B', isOpen: true }]);
    });
    it('handles empty arrays', () => {
      expect(getOpenStalls([])).toEqual([]);
    });
  });

  describe('sortByWaitTime', () => {
    it('sorts correctly in ascending order', () => {
      const input = [{ name: 'A', waitTime: 10 }, { name: 'B', waitTime: 5 }, { name: 'C', waitTime: 15 }];
      const expected = [{ name: 'B', waitTime: 5 }, { name: 'A', waitTime: 10 }, { name: 'C', waitTime: 15 }];
      expect(sortByWaitTime(input)).toEqual(expected);
    });
    it('does not mutate original array', () => {
      const input = [{ name: 'A', waitTime: 10 }, { name: 'B', waitTime: 5 }];
      sortByWaitTime(input);
      expect(input[0].name).toBe('A');
    });
    it('handles stalls with equal wait times', () => {
      const input = [{ name: 'A', waitTime: 5 }, { name: 'B', waitTime: 5 }];
      expect(sortByWaitTime(input).length).toBe(2);
    });
    it('handles empty arrays', () => {
      expect(sortByWaitTime([])).toEqual([]);
    });
  });

  describe('getPreOrderEligible', () => {
    it('returns only preOrderEnabled stalls', () => {
      const input = [{ name: 'A', preOrderEnabled: true }, { name: 'B', preOrderEnabled: false }];
      expect(getPreOrderEligible(input)).toEqual([{ name: 'A', preOrderEnabled: true }]);
    });
    it('returns empty array if no stalls are eligible', () => {
      const input = [{ name: 'A', preOrderEnabled: false }];
      expect(getPreOrderEligible(input)).toEqual([]);
    });
    it('handles missing preOrderEnabled field', () => {
      const input = [{ name: 'A' }, { name: 'B', preOrderEnabled: true }];
      expect(getPreOrderEligible(input)).toEqual([{ name: 'B', preOrderEnabled: true }]);
    });
    it('handles empty arrays', () => {
      expect(getPreOrderEligible([])).toEqual([]);
    });
  });
});

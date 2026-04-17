import { Alert } from '../types';

// alerts.test.ts
const filterActiveAlerts = (alerts: Partial<Alert>[] | any[]) => alerts.filter((a: any) => a.active === true);
const sortAlertsByTime = (alerts: Partial<Alert>[] | any[]) => [...alerts].sort((a, b) => b.time - a.time);
const getAlertColor = (type: string) => {
  switch (type) {
    case 'crowd_redirect': return 'red';
    case 'weather': return 'amber';
    case 'info': return 'blue';
    default: return 'gray';
  }
};

describe('Alerts Utilities', () => {
  describe('filterActiveAlerts', () => {
    it('returns only active alerts', () => {
      const input = [{ id: 1, active: true }, { id: 2, active: false }];
      expect(filterActiveAlerts(input)).toEqual([{ id: 1, active: true }]);
    });
    it('returns empty array if no active alerts', () => {
      const input = [{ id: 1, active: false }];
      expect(filterActiveAlerts(input)).toEqual([]);
    });
    it('handles empty input arrays', () => {
      expect(filterActiveAlerts([])).toEqual([]);
    });
    it('handles missing active field', () => {
      const input = [{ id: 1, active: true }, { id: 2 }];
      expect(filterActiveAlerts(input)).toEqual([{ id: 1, active: true }]);
    });
  });

  describe('sortAlertsByTime', () => {
    it('sorts newest first (descending order)', () => {
      const input = [{ id: 1, time: 100 }, { id: 2, time: 300 }, { id: 3, time: 200 }];
      const expected = [{ id: 2, time: 300 }, { id: 3, time: 200 }, { id: 1, time: 100 }];
      expect(sortAlertsByTime(input)).toEqual(expected);
    });
    it('does not mutate original array', () => {
      const input = [{ id: 1, time: 100 }, { id: 2, time: 300 }];
      sortAlertsByTime(input);
      expect(input[0].id).toBe(1);
    });
    it('handles identical times', () => {
      const input = [{ id: 1, time: 100 }, { id: 2, time: 100 }];
      expect(sortAlertsByTime(input).length).toBe(2);
    });
    it('handles empty arrays', () => {
      expect(sortAlertsByTime([])).toEqual([]);
    });
  });

  describe('getAlertColor', () => {
    it('returns red for crowd_redirect', () => {
      expect(getAlertColor('crowd_redirect')).toBe('red');
    });
    it('returns amber for weather', () => {
      expect(getAlertColor('weather')).toBe('amber');
    });
    it('returns blue for info', () => {
      expect(getAlertColor('info')).toBe('blue');
    });
    it('returns gray for unknown types', () => {
      expect(getAlertColor('unknown_type')).toBe('gray');
    });
  });
});

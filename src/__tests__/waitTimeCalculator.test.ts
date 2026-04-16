import { calcWaitTimeDisplay } from '../data/seedData'

describe('calcWaitTimeDisplay', () => {
  it('returns ~1 min for 0 minutes', () => {
    expect(calcWaitTimeDisplay(0)).toBe('~1 min')
  })

  it('returns ~1 min for 1 minute', () => {
    expect(calcWaitTimeDisplay(1)).toBe('~1 min')
  })

  it('returns singular min for 2 minutes', () => {
    expect(calcWaitTimeDisplay(2)).toBe('~2 mins')
  })

  it('returns ~5 mins for 5 minutes', () => {
    expect(calcWaitTimeDisplay(5)).toBe('~5 mins')
  })

  it('returns ~12 mins for 12 minutes', () => {
    expect(calcWaitTimeDisplay(12)).toBe('~12 mins')
  })

  it('returns ~59 mins for 59 minutes', () => {
    expect(calcWaitTimeDisplay(59)).toBe('~59 mins')
  })

  it('returns 1h for 60 minutes', () => {
    expect(calcWaitTimeDisplay(60)).toBe('1h ')
  })

  it('returns 1h 30m for 90 minutes', () => {
    expect(calcWaitTimeDisplay(90)).toBe('1h 30m')
  })

  it('returns 2h 15m for 135 minutes', () => {
    expect(calcWaitTimeDisplay(135)).toBe('2h 15m')
  })
})

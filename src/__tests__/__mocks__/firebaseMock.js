// Mock firebase module for tests
jest.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: null },
  functions: {},
  getMessagingInstance: jest.fn().mockResolvedValue(null),
  default: {},
}))

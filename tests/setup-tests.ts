import { jest } from '@jest/globals';

jest.mock('@actions/core', () => ({
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
}));

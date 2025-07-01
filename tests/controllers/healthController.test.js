const { expect } = require('@jest/globals');
const healthController = require('../../src/controllers/healthController');

describe('Health Controller', () => {
  let mockRequest;
  let mockResponseToolkit;

  beforeEach(() => {
    mockRequest = {};
    mockResponseToolkit = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    };
  });

  describe('getHealth', () => {
    it('should return healthy status', async () => {
      const result = await healthController.getHealth(mockRequest, mockResponseToolkit);

      expect(mockResponseToolkit.response).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'celoe-logs-backend'
        })
      );
      expect(mockResponseToolkit.code).toHaveBeenCalledWith(200);
    });

    it('should include uptime in response', async () => {
      await healthController.getHealth(mockRequest, mockResponseToolkit);

      const responseCall = mockResponseToolkit.response.mock.calls[0][0];
      expect(responseCall).toHaveProperty('uptime');
      expect(responseCall).toHaveProperty('timestamp');
      expect(typeof responseCall.uptime).toBe('number');
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      const result = await healthController.getDetailedHealth(mockRequest, mockResponseToolkit);

      expect(mockResponseToolkit.response).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          checks: expect.any(Object),
          version: expect.any(String),
          environment: expect.any(String)
        })
      );
    });

    it('should include memory usage check', async () => {
      await healthController.getDetailedHealth(mockRequest, mockResponseToolkit);

      const responseCall = mockResponseToolkit.response.mock.calls[0][0];
      expect(responseCall.checks).toHaveProperty('memory');
      expect(responseCall.checks.memory).toHaveProperty('status', 'healthy');
      expect(responseCall.checks.memory).toHaveProperty('usage');
    });
  });
});

// Example of integration test structure
describe('Health Controller Integration', () => {
  // Integration tests would go here
  // Testing with actual database connections, etc.
}); 
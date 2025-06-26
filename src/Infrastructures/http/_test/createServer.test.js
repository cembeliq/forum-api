const createServer = require('../createServer');
const container = require('../../container');

// Mock the users plugin
jest.mock('../../../Interfaces/http/api/users', () => ({
  name: 'users',
  version: '1.0.0',
  register: jest.fn().mockImplementation(async (server) => {
    // Add a test route that throws an error
    server.route({
      method: 'GET',
      path: '/test-error',
      handler: () => {
        throw new Error('Test error');
      }
    });
  })
}));

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Create a minimal container for testing error handling
    const testContainer = {
      register: container.register.bind(container),
      getInstance: () => ({
        jwt: {
          accessTokenKey: 'test_key',
          accessTokenAge: 1800,
          refreshTokenKey: 'test_refresh_key'
        }
      })
    };
    
    const server = await createServer(testContainer);

    // Action - trigger the error route
    const response = await server.inject({
      method: 'GET',
      url: '/test-error',
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Hello world!');
    });
  });
});


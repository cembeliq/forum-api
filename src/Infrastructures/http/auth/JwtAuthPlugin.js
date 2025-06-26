const Jwt = require('@hapi/jwt');

const JwtAuthPlugin = {
  name: 'jwt-auth',
  version: '1.0.0',
  register: async (server, { container } = {}) => {
    await server.register(Jwt);

    // Default config
    const defaultConfig = {
      jwt: {
        accessTokenKey: process.env.ACCESS_TOKEN_KEY || 'secret',
        accessTokenAge: 1800, // 30 minutes in seconds
        refreshTokenKey: process.env.REFRESH_TOKEN_KEY || 'refresh_secret',
      },
    };

    // Helper to safely get config
    const getConfig = () => {
      try {
        if (!container) {
          console.warn('Container not provided, using default JWT config');
          return defaultConfig;
        }

        if (typeof container.getInstance !== 'function') {
          console.warn('Container does not have getInstance method, using default JWT config');
          return defaultConfig;
        }

        const containerConfig = container.getInstance('config');
        if (!containerConfig) {
          console.warn('Could not get config from container, using default JWT config');
          return defaultConfig;
        }

        return containerConfig;
      } catch (error) {
        console.warn('Error getting config from container, using default JWT config:', error.message);
        return defaultConfig;
      }
    };
    
    // Get the config
    const config = getConfig();
    
    // Ensure we have the required JWT config
    const jwtConfig = {
      accessTokenKey: (config.jwt && config.jwt.accessTokenKey) || defaultConfig.jwt.accessTokenKey,
      accessTokenAge: (config.jwt && config.jwt.accessTokenAge) || defaultConfig.jwt.accessTokenAge,
    };

    // Define the JWT strategy
    server.auth.strategy('forumapi_jwt', 'jwt', {
      keys: jwtConfig.accessTokenKey,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: jwtConfig.accessTokenAge,
      },
      validate: (artifacts) => {
        if (!artifacts.decoded || !artifacts.decoded.payload) {
          return { isValid: false };
        }
        return {
          isValid: true,
          credentials: {
            id: artifacts.decoded.payload.id,
          },
        };
      },
    });
  },
};

module.exports = JwtAuthPlugin;

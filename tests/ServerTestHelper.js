/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const userPayload = {
      id: 'user-123',
      username: 'dicoding',
    };
    
    // Check if user exists before adding
    const users = await UsersTableTestHelper.findUsersById(userPayload.id);
    if (users.length === 0) {
      await UsersTableTestHelper.addUser(userPayload);
    }
    
    return Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY || 'secret');
  },
};

module.exports = ServerTestHelper;

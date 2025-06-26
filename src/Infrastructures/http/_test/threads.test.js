const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

const UserTestHelper = {
  async getAccessToken(server, username = 'dicoding') {
    // Add user first
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Login to get token
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password: 'secret',
      },
    });

    const responseJson = JSON.parse(loginResponse.payload);
    return responseJson.data.accessToken;
  },
};

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });
    
    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await UserTestHelper.getAccessToken(server);
      const requestPayload = {
        title: 'Thread Title',
        // body property is missing
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
    
    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await UserTestHelper.getAccessToken(server);
      const requestPayload = {
        title: 123, // should be string
        body: 'Thread Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 when token invalid', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: 'Bearer invalid_token',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted thread when authenticated', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await UserTestHelper.getAccessToken(server);
      
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toMatchObject({
        id: expect.any(String),
        title: requestPayload.title,
        owner: expect.any(String), // Owner should be set from token
      });

      // Verify in database
      const threads = await ThreadTableTestHelper.findThreadById(responseJson.data.addedThread.id);
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toEqual(requestPayload.title);
      expect(threads[0].body).toEqual(requestPayload.body);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-not-found',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 and return thread detail correctly', async () => {
      // Arrange
      const server = await createServer(container);
      
      // Add users directly using the test helper
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'secret',
        fullname: 'John Doe',
      });

      // Add a thread
      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      });

      // Add comments to the thread
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-456';
      const date1 = new Date('2021-08-08T07:22:33.555Z');
      const date2 = new Date('2021-08-08T07:26:21.338Z');

      await CommentsTableTestHelper.addComment({
        id: commentId1,
        threadId,
        content: 'sebuah comment',
        owner: 'user-456', // johndoe
        date: date1,
      });
      
      await CommentsTableTestHelper.addComment({
        id: commentId2,
        threadId,
        content: 'sebuah comment lagi',
        owner: 'user-123', // dicoding
        date: date2,
        isDelete: true,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('sebuah thread');
      expect(responseJson.data.thread.body).toEqual('sebuah body thread');
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      
      // First comment should be intact
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toEqual('johndoe');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('sebuah comment');
      
      // Second comment should be deleted (content replaced)
      expect(responseJson.data.thread.comments[1].id).toBeDefined();
      expect(responseJson.data.thread.comments[1].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[1].date).toBeDefined();
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });
  });
});
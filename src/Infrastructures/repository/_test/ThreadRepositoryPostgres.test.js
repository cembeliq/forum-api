const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
    afterEach(async () => {
        await ThreadTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread function', () => {
        it('should add thread to the database correctly', async () => {
            // Arrange
            const thread = {
                title: 'Thread Title',
                body: 'Thread Body',
                owner: 'user-123',
            };
            const addedThread = new AddedThread({
                id: 'thread-123',
                title: 'Thread Title',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const result = await threadRepositoryPostgres.addThread(thread);

            // Assert
            expect(result).toEqual(addedThread);

            const threads = await ThreadTableTestHelper.findThreadById('thread-123');
            expect(threads).toHaveLength(1);
        });

        it('should return added thread correctly', async () => {
            // Arrange
            const thread = {
              title: 'Thread Title',
              body: 'Thread Body',
              owner: 'user-123',
            };
            const fakeIdGenerator = () => '123'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      
            // Action
            const addedThread = await threadRepositoryPostgres.addThread(thread);
      
            // Assert
            expect(addedThread).toStrictEqual(new AddedThread({
              id: 'thread-123',
              title: 'Thread Title',
              owner: 'user-123',
            }));
        });
    });

  describe('getThreadDetail function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadDetail('thread-not-found'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userId = 'user-123';
      const date = new Date('2021-08-08T07:19:09.775Z');

      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
        createdAt: date,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadDetail(threadId);

      // Assert
      expect(threadDetail).toMatchObject({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        username: 'dicoding',
      });
      expect(threadDetail.date).toBeDefined();
      expect(new Date(threadDetail.date)).toBeInstanceOf(Date);
    });
  });

  describe('getThreadById function', () => {
    it('should not throw error when thread exists', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userId = 'user-123';
      const date = new Date('2021-08-08T07:19:09.775Z');

      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
        createdAt: date,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(threadId))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const nonExistentThreadId = 'thread-not-found';

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(nonExistentThreadId))
        .rejects.toThrow(NotFoundError);
      await expect(threadRepositoryPostgres.getThreadById(nonExistentThreadId))
        .rejects.toThrow('Thread tidak ditemukan');
    });
  }); 
}); 
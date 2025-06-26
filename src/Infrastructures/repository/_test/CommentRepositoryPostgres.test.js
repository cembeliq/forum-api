const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const owner = 'user-123';
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      
      const newComment = new Comment({
        content: 'a comment',
        threadId,
        owner,
      });
      
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      }));
    });

    // Test for thread existence check removed as it's now handled in the use case
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when no comments exist for the thread', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toEqual([]);
    });

    it('should return all comments from the thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-456';
      const date1 = new Date('2021-08-08T07:22:33.555Z');
      const date2 = new Date('2021-08-08T07:26:21.338Z');
      
      // Add users
      await UsersTableTestHelper.addUser({ id: userId1, username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: userId2, username: 'johndoe' });
      
      // Add thread
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId1 });
      
      // Add comments
      await CommentsTableTestHelper.addComment({
        id: commentId1,
        threadId,
        owner: userId1,
        content: 'sebuah comment',
        createdAt: date1,
      });
      
      await CommentsTableTestHelper.addComment({
        id: commentId2,
        threadId,
        owner: userId2,
        content: 'sebuah comment lagi',
        createdAt: date2,
        isDelete: true,
      });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(commentId1);
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].date).toBeDefined();
      expect(comments[0].content).toEqual('sebuah comment');
      expect(comments[0].isDelete).toEqual(false);
      
      expect(comments[1].id).toEqual(commentId2);
      expect(comments[1].username).toEqual('johndoe');
      expect(comments[1].date).toBeDefined();
      expect(comments[1].content).toEqual('sebuah comment lagi');
      expect(comments[1].isDelete).toEqual(true);
    });
  });

  describe('checkThreadIsExist function', () => {
    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkThreadIsExist(threadId))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const nonExistentThreadId = 'nonexistent-thread';

      // Action & Assert
      await expect(commentRepositoryPostgres.checkThreadIsExist(nonExistentThreadId))
        .rejects.toThrowError(NotFoundError);
      await expect(commentRepositoryPostgres.checkThreadIsExist(nonExistentThreadId))
        .rejects.toThrowError('Thread tidak ditemukan');
    });
  });

  describe('getCommentByIdAndThreadId function', (  ) => {
    it('should not throw error when comment exists', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const owner = 'user-123';
      const content = 'a comment';
      const createdAt = new Date('2021-08-08T07:22:33.555Z');
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner, content, createdAt });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByIdAndThreadId(commentId, threadId))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentId = 'nonexistent-comment';
      const threadId = 'thread-123';
      const owner = 'user-123';
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByIdAndThreadId(commentId, threadId))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should not throw AuthorizationError when comment owner matches', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const owner = 'user-123';
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, owner))
        .resolves.not.toThrow(AuthorizationError);
    });

    it('should throw AuthorizationError when comment owner does not match', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const owner = 'user-123';
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, 'user-456'))
        .rejects.toThrowError(AuthorizationError);
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, 'user-456'))
        .rejects.toThrowError('Anda tidak berhak mengakses resource ini');
    });

    it('should throw NotFoundError when comment does not exist', async (  ) => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const nonExistentCommentId = 'nonexistent-comment';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(nonExistentCommentId, 'user-123'))
        .rejects.toThrowError(NotFoundError);
      await expect(commentRepositoryPostgres.verifyCommentOwner(nonExistentCommentId, 'user-123'))
        .rejects.toThrowError('Komentar tidak ditemukan');
    });
  });

  describe('deleteComment function', () => {
    it('should mark comment as deleted', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const owner = 'user-123';
      
      // Add user and thread first
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const nonExistentCommentId = 'nonexistent-comment';

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment(nonExistentCommentId))
        .rejects.toThrowError(NotFoundError);
      await expect(commentRepositoryPostgres.deleteComment(nonExistentCommentId))
        .rejects.toThrowError('Komentar tidak ditemukan');
    });
  }); 


});

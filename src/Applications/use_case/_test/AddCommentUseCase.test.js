const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    });

    /** mocking needed function */
    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue(mockAddedComment)
    };
    
    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({})
    };

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action 
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new Comment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
  });
  
  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /** mocking needed function */
    const mockCommentRepository = {
      addComment: jest.fn()
    };
    
    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new NotFoundError('Thread tidak ditemukan'))
    };

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});

const Comment = require('../../Domains/comments/entities/Comment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const comment = new Comment(useCasePayload);
    
    await this._threadRepository.getThreadById(comment.threadId);
    
    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;

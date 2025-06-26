const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadDetail(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const detailComments = comments.map((comment) => new DetailComment(comment));
    
    return new DetailThread({
      ...threadDetail,
      comments: detailComments,
    });
  }
}

module.exports = GetThreadDetailUseCase;

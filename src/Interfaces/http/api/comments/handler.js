const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    try {
      const { id: owner } = request.auth.credentials;
      const { threadId } = request.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      
      const addedComment = await addCommentUseCase.execute({
        content: request.payload.content,
        threadId,
        owner,
      });

      const response = h.response({
        status: 'success',
        data: {
          addedComment,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }
      
      // Let the server error handler handle other types of errors
      throw error;
    }
  }

  async deleteCommentHandler(request, h) {
    try {
      const { id: owner } = request.auth.credentials;
      const { threadId, commentId } = request.params;
      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute({
        threadId,
        commentId,
        owner,
      });

      const response = h.response({
        status: 'success',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }
      
      if (error.name === 'AuthorizationError') {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(403);
        return response;
      }
      
      // Let the server error handler handle other types of errors
      throw error;
    }
  }
}

module.exports = CommentsHandler;

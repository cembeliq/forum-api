const Joi = require('@hapi/joi');

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
        }),
        payload: Joi.object({
          content: Joi.string().required(),
        }),
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: 'Data yang dikirimkan tidak lengkap atau tidak valid',
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
        }),
      },
    },
  },
]);

module.exports = routes;

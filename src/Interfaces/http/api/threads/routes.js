const Joi = require('@hapi/joi');

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          body: Joi.string().required(),
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
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadDetailHandler,
  },
]);

module.exports = routes;
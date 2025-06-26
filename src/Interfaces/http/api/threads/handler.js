const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadsHandler {
    constructor(container) {
        this._container = container;

        this.postThreadHandler = this.postThreadHandler.bind(this);
        this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    }

    async postThreadHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { title, body } = request.payload;
        
        const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
        const addedThread = await addThreadUseCase.execute({
            title,
            body,
            owner: credentialId,
        });

        const response = h.response({
            status: 'success',
            data: {
                addedThread,
            },
        });
        response.code(201);
        return response;
    }

    async getThreadDetailHandler(request, h) {
        const { threadId } = request.params;
        const getThreadDetailUseCase = this._container.getInstance('GetThreadDetailUseCase');
        const thread = await getThreadDetailUseCase.execute(threadId);

        return {
            status: 'success',
            data: {
                thread,
            },
        };
    }
}

module.exports = ThreadsHandler;

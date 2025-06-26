const AddedThread = require('../../Domains/threads/entities/AddedThread');
const Thread = require('../../Domains/threads/entities/Thread');

class AddThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(payload) {
        const thread = new Thread(payload);
        return this._threadRepository.addThread(thread);
    }
}

module.exports = AddThreadUseCase;

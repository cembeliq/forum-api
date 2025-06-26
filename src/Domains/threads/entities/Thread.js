class Thread {
    constructor(payload) {
        this._verifyPayload(payload);

        const { title, body, owner } = payload;

        this.title = title;
        this.body = body;
        this.owner = owner;
    }

    _verifyPayload(payload) {
        const { title, body } = payload;

        if (!title || !body) {
            throw new Error('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof title !== 'string' || typeof body !== 'string') {
            throw new Error('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}   

module.exports = Thread;

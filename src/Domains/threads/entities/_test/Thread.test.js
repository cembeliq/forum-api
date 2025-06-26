const Thread = require('../Thread');

describe('Thread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            title: 'Thread Title',
        };

        // Action and Assert
        expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            title: 123,
            body: 'Thread Body',
        };

        // Action and Assert
        expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread object correctly', () => {
        // Arrange
        const payload = {
            title: 'Thread Title',
            body: 'Thread Body',
        };

        // Action
        const thread = new Thread(payload);

        // Assert
        expect(thread.title).toEqual(payload.title);
        expect(thread.body).toEqual(payload.body);
    });
});

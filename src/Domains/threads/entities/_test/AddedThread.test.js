const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            title: 'Thread Title',
        };

        // Action and Assert
        expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            title: 'Thread Title',
            body: 'Thread Body',
            owner: 'user-123',
        };

        // Action and Assert
        expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create addedThread object correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'Thread Title',
            owner: 'user-123',
        };

        // Action
        const addedThread = new AddedThread(payload);

        // Assert
        expect(addedThread.id).toEqual(payload.id);
        expect(addedThread.title).toEqual(payload.title);
        expect(addedThread.owner).toEqual(payload.owner);
    }); 
});

module.exports = AddedThread;


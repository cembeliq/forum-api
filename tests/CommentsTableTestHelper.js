/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'sebuah comment',
    owner = 'user-123',
    threadId = 'thread-123',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id, is_delete) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, owner, threadId, isDelete],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;

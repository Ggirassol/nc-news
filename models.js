const db = require("./db/connection");
const fs = require("fs/promises");

function selectTopics() {
  return db.query(`SELECT * FROM topics`).then((data) => {
    return data.rows;
  });
}

function selectDescription() {
  return fs.readFile("endpoints.json", "utf-8").then((data) => {
    const parsedEndpoints = JSON.parse(data);
    return { description: parsedEndpoints };
  });
}

function selectArticleById(articleId) {
  return db
    .query(
      `SELECT articles.article_id, title, topic, articles.author, articles.body, articles.created_at, articles.votes, article_img_url,
    COUNT(comment_id)::int AS comment_count FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
`,
      [articleId]
    )
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article id not found" });
      }
      return data.rows[0];
    });
}

function checkIfTopicExists(topic) {
  if (topic) {
    return db
      .query("SELECT * FROM topics WHERE slug = $1", [topic])
      .then((result) => {
        if (result.rows.length === 0) {
          return Promise.reject({ status: 400, msg: "Topic does not exist" });
        }
      });
  }
}

function selectArticles(topic, sort_by = "created_at", order_by = "desc") {
  const validSortBy = [
    "article_id",
    "title",
    "author",
    "topic",
    "created_at",
    "votes",
  ];

  const validOrderBy = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid given sort_by" });
  }
  if (!validOrderBy.includes(order_by)) {
    return Promise.reject({ status: 400, msg: "invalid given order_by" });
  }

  let sqlString = `SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url,
  COUNT(comment_id)::int AS comment_count FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const queryValues = [];

  if (topic) {
    sqlString += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  sqlString += ` GROUP BY articles.article_id
                ORDER BY ${sort_by} ${order_by}`;

  return db.query(sqlString, queryValues).then((data) => {
    if (data.rows.length === 0) {
      return [];
    }
    return data.rows;
  });
}

function selectCommentsByArticleId(articleId) {
  return db
    .query(
      `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [articleId]
    )
    .then((data) => {
      return data.rows;
    });
}

function addComment(articleId, username, body) {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `INSERT INTO comments
    (body, author, article_id, votes)
    VALUES
    ($1, $2, $3, 0)
    RETURNING *;`,
      [body, username, articleId]
    )
    .then((data) => {
      return data.rows[0];
    });
}

function updateVotesByArticleId(articleId, inc_votes) {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `UPDATE articles
    SET votes = votes + $1 
    WHERE article_id = $2
    RETURNING *;`,
      [inc_votes, articleId]
    )
    .then((data) => {
      return data.rows[0];
    });
}

function removeCommentById(commentId) {
  return db
    .query(
      `DELETE FROM comments
        WHERE comment_id = $1`,
      [commentId]
    )
    .then((res) => {
      if (res.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "No comment with given id found",
        });
      }
    });
}

function selectUsers() {
  return db.query(`SELECT * FROM users`).then((data) => {
    return data.rows;
  });
}

function selectUsersByUsername(username) {
  return db
    .query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    )
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Username not found" });
      }
      return data.rows[0];
    });
}

function selectCommentByCommentId(commentId) {
  return db.query(`SELECT * FROM comments WHERE comment_id = $1`, [commentId])
  .then((data) => {
    if (data.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment id not found" });
    }
    return data.rows[0];
  });
}

function updateVotesByCommentId(commentId, inc_votes) {
  if(!inc_votes) {
    return Promise.reject({ status: 400, msg: "Bad request"})
  }
  return db.query(`UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
  [inc_votes, commentId])
  .then((data) => {
    return data.rows[0]
  })
}

module.exports = {
  selectTopics,
  selectDescription,
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  addComment,
  updateVotesByArticleId,
  removeCommentById,
  selectUsers,
  checkIfTopicExists,
  selectUsersByUsername,
  selectCommentByCommentId,
  updateVotesByCommentId
};

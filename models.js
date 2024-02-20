const db = require('./db/connection')
const fs = require('fs/promises')
const format = require('pg-format')

function selectTopics() {
    return db.query(`SELECT * FROM topics`)
    .then((data) => {
        return data.rows
    })
}

function selectDescription() {
    return fs.readFile('endpoints.json', 'utf-8')
    .then((data) => {
        const parsedEndpoints = JSON.parse(data)
        return { description: parsedEndpoints }
    })
}

function selectArticleById (articleId) {

    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then((data) => {
        if (data.rows.length === 0) {
            return Promise.reject( {status: 404, msg: 'Article id not found'})
        }
        return data.rows[0]
    })
}

function selectArticles() {
    return db.query(`SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url,
    COUNT(comment_id)::int AS comment_count FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC`)
    .then((data) => {
        return data.rows
    })
}

function selectCommentsByArticleId(articleId) {
    return db.query(`SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`, [articleId])
    .then((data) => {
        return data.rows
    })
}

function addComment(articleId, username, body) {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: 'Bad request' });
    }
    return db.query(`INSERT INTO comments
    (body, author, article_id, votes)
    VALUES
    ($1, $2, $3, 0)
    RETURNING *;`, [body, username, articleId])
    .then((data) => {
        return data.rows[0]
    })
}


module.exports = { selectTopics, selectDescription, selectArticleById, selectArticles, selectCommentsByArticleId, addComment}
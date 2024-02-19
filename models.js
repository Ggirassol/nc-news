const db = require('./db/connection')
const fs = require('fs/promises')

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



module.exports = { selectTopics, selectDescription, selectArticleById }
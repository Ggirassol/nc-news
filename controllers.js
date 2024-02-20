const { selectTopics, selectDescription, selectArticleById, selectArticles, selectCommentsByArticleId, addComment } = require("./models")



function getTopics(req, res, next) {
    selectTopics()
    .then((topics) => {
        res.status(200).send( {topics} )
    })
    .catch((err) => next(err))
}

function getDescription(req, res, next) {
    selectDescription()
    .then((description) => {
        res.status(200).send( {description} )
    })
    .catch((err) => next(err))
}

function getArticleById(req, res, next) {
    const articleId = req.params.article_id
    selectArticleById(articleId)
    .then((article) => {
        res.status(200).send( {article} )
    })
    .catch((err) => next(err))
}

function getArticles(req, res, next) {
    selectArticles()
    .then((articles) => {
        res.status(200).send( {articles} )
    })
    .catch((err) => next(err))
}

function getCommentsByArticleId(req, res, next) {
    const articleId = req.params.article_id
    const promises = [ selectArticleById(articleId), selectCommentsByArticleId(articleId)]

    Promise.all(promises) 
    .then((results) => {
            res.status(200).send({ comments: results [1]});
    })
    .catch((err) => next(err))
}

function createComment(req, res, next) {
    const articleId = req.params.article_id
    const { username, body } = req.body
    const promises = [ selectArticleById(articleId), addComment(articleId, username, body)]

    Promise.all(promises) 
    .then((results) => {
        console.log(results)
        res.status(201).send({ newComment: results[1]})
    })
    .catch((err) => next(err))
}

module.exports = { getTopics, getDescription, getArticleById, getArticles, getCommentsByArticleId, createComment }
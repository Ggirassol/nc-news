const { selectTopics, selectDescription, selectArticleById, selectArticles, selectCommentsByArticleId } = require("./models")



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
        if (results[1].length === 0) {
            res.status(201).send({ comments: results[1]});
        } else {
            res.status(200).send({ comments: results [1]});
        }
    })
    .catch((err) => next(err))
}

module.exports = { getTopics, getDescription, getArticleById, getArticles, getCommentsByArticleId }
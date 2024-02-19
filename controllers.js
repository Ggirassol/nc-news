const { selectTopics, selectDescription, selectArticleById } = require("./models")



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


module.exports = { getTopics, getDescription, getArticleById }
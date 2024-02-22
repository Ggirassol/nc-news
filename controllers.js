const { selectTopics, selectDescription, selectArticleById, selectArticles, selectCommentsByArticleId, addComment, updateVotesByArticleId, removeCommentById, selectUsers, checkIfTopicExists } = require("./models")



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
    const topic = req.query.topic
    const sort_by = req.query.sort_by
    const order_by = req.query.order_by

    const promises = [ checkIfTopicExists(topic), selectArticles(topic, sort_by, order_by)]

    Promise.all(promises) 
    .then((results) => {
            res.status(200).send({ articles: results [1]});
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
        res.status(201).send({ newComment: results[1]})
    })
    .catch((err) => next(err))
}

function editVotesByArticleId(req, res, next) {
    const articleId = req.params.article_id
    const { inc_votes } = req.body
    const promises = [ selectArticleById(articleId), updateVotesByArticleId(articleId, inc_votes)]

    Promise.all(promises) 
    .then((results) => {
        res.status(200).send({ updatedArticle: results[1]})
    })
    .catch((err) => next(err))
}


function deleteCommentById(req, res, next) {
  const commentId = req.params.comment_id;
  removeCommentById(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => next(err));
}

function getUsers(req, res, next) {
    selectUsers()
    .then((users) => {
        res.status(200).send( {users})
    })
    .catch((err) => next(err));
}

module.exports = { getTopics, getDescription, getArticleById, getArticles, getCommentsByArticleId, createComment, editVotesByArticleId, deleteCommentById, getUsers }
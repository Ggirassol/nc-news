const express = require('express')
const { getTopics, getDescription, getArticleById, getArticles, getCommentsByArticleId, createComment, editVotesByArticleId, deleteCommentById, getUsers } = require("./controllers");
const app = express();
app.use(express.json());



app.get("/api/topics", getTopics)

app.get("/api", getDescription)

app.get("/api/articles/:article_id", getArticleById)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

app.post("/api/articles/:article_id/comments", createComment)

app.patch("/api/articles/:article_id", editVotesByArticleId)

app.delete("/api/comments/:comment_id", deleteCommentById)

app.get("/api/users", getUsers)


app.get("*", (req,res) => {
    res.status(404).send({ msg: 'Page not found' });
})

app.use((err, req, res, next) => {
  if (err.code === '23503') {
    res.status(400).send({ msg: 'Incorrect username' })
  }
  next(err)
});

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
      res.status(400).send({ msg: 'Bad request' })
    }
    next(err)
  });

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send( {msg: err.msg} )
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  });

module.exports = app;
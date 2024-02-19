const express = require('express')
const { getTopics, getDescription, getArticleById } = require("./controllers");
const app = express();



app.get("/api/topics", getTopics)

app.get("/api", getDescription)

app.get("/api/articles/:article_id", getArticleById)



app.get("*", (req,res) => {
    res.status(404).send({ msg: 'Page not found' });
})

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
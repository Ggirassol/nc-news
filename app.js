const express = require('express')
const { getTopics, getDescription } = require("./controllers");
const app = express();



app.get("/api/topics", getTopics)

app.get("/api", getDescription)



app.get("*", (req,res) => {
    res.status(404).send({ msg: 'Page not found' });
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  });

module.exports = app;
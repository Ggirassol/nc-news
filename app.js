const express = require("express");
const app = express();
app.use(express.json());

const {
  handleCustomErrors,
  handleIncorrectUserName,
  handleServerErrors,
  handlePsqlErrors,
  handleNotFound,
} = require("./errorhandler");

const {
  getTopics,
  getDescription,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  createComment,
  editVotesByArticleId,
  deleteCommentById,
  getUsers,
  getUserByUsername,
} = require("./controllers");

app.get("/api/topics", getTopics);
app.get("/api", getDescription);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);

app.post("/api/articles/:article_id/comments", createComment);

app.patch("/api/articles/:article_id", editVotesByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("*", handleNotFound);
app.use(handleIncorrectUserName);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;

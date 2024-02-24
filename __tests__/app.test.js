const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const endpoints = require("../endpoints.json");
const sort = require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  it("responds with 200 status", () => {
    return request(app).get("/api/topics").expect(200);
  });
  it("responds with an array of topic objects with length 3", () => {
    return request(app)
      .get("/api/topics")
      .then((res) => {
        const topics = res.body.topics;
        expect(topics).toHaveLength(3);
      });
  });
  it("responds with an array of topic objects containing slug and description as porperties", () => {
    return request(app)
      .get("/api/topics")
      .then((res) => {
        const topics = res.body.topics;
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/", () => {
  it("responds with 200 status", () => {
    return request(app).get("/api").expect(200);
  });
  it("responds with an object matching the endpoints.js object", () => {
    return request(app)
      .get("/api")
      .then((res) => {
        const description = res.body.description;
        expect(description.description).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("responds with an article object with respective properties. Status code: 200", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T21:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 11,
        });
      });
  });
  it("responds with error when article type is invalid", () => {
    return request(app)
      .get("/api/articles/one")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when article types is valid, but article does not exist", () => {
    return request(app)
      .get("/api/articles/101")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  });
});

describe("GET /api/articles", () => {
  it("responds with an array of article objects with the respective length. Status code: 200", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toHaveLength(13);
      });
  });
  it("responds with an array of article objects with the respective length, having their respective properties. No body property", () => {
    return request(app)
      .get("/api/articles")
      .then((res) => {
        const articles = res.body.articles;
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  it("comment_count provides the right ammount of comments", () => {
    return request(app)
      .get("/api/articles")
      .then((res) => {
        const articles = res.body.articles;
        articles.forEach((article) => {
          let count = 0;
          testData.commentData.forEach((comment) => {
            if (comment.article_id === article.article_id) {
              count++;
            }
          });
          expect(article.comment_count).toBe(count);
        });
      });
  });
  it("articles array is sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("responds with an array of comments for the given array with the right length. Status code: 200", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toHaveLength(11);
      });
  });
  it("responds with an array of comments for the given article_id. All comments have respective correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  it("responds with an array sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  it("responds with an error when article type is invalid", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when article type is valid, but article does not exist", () => {
    return request(app)
      .get("/api/articles/101/comments")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  });
  it("responds with empty array when given article exists but there are no associated comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((res) => {
        const comments = res.body.comments;
        expect(comments).toHaveLength(0);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("responds with the posted comment when request body is an object with username an body properties. Status code: 201", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "rogersop",
        body: "So in love with this article",
      })
      .expect(201)
      .then((res) => {
        const newComment = res.body.newComment;
        expect(newComment).toMatchObject({
          comment_id: 19,
          votes: 0,
          created_at: expect.any(String),
          author: "rogersop",
          body: "So in love with this article",
          article_id: 3,
        });
      });
  });
  it("responds with an error when request body doesn't have username and body properties", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        name: "rogersop",
        comment: "So in love with this article",
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with an error when unrecognised user trying to create a comment", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "NonExistent",
        body: "So in love with this article",
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Incorrect username");
      });
  });
  it("responds with an error when article type is invalid", () => {
    return request(app)
      .post("/api/articles/one/comments")
      .send({
        username: "rogersop",
        body: "So in love with this article",
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when article types is valid, but article does not exist", () => {
    return request(app)
      .post("/api/articles/101/comments")
      .send({
        username: "rogersop",
        body: "So in love with this article",
      })
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  it("responds with updated article's votes using the respective article_id. Status code: 200", () => {
    return request(app)
      .patch("/api/articles/4")
      .send({
        inc_votes: 5,
      })
      .expect(200)
      .then((res) => {
        const updatedArticle = res.body.updatedArticle;
        expect(updatedArticle.votes).toBe(5);
      });
  });
  it("updates a given article's votes by article_id when inc_votes is negative", () => {
    return request(app)
      .patch("/api/articles/4")
      .send({
        inc_votes: -5,
      })
      .expect(200)
      .then((res) => {
        const updatedArticle = res.body.updatedArticle;
        expect(updatedArticle.votes).toBe(-5);
      });
  });
  it("responds with an error when request body doesn't have inc_votes property", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        votes: 10,
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with an error when article type is invalid", () => {
    return request(app)
      .patch("/api/articles/one")
      .send({
        inc_votes: 5,
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when article types is valid, but article does not exist", () => {
    return request(app)
      .patch("/api/articles/101")
      .send({
        inc_votes: 5,
      })
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("responds with status 204 and no content", () => {
    return request(app)
      .delete("/api/comments/5")
      .expect(204)
      .then((res) => {
        const body = res.body;
        expect(body).toEqual({});
      });
  });
  it("deletes given comment", () => {
    const deletedCommentId = 6;
    return request(app)
      .delete(`/api/comments/${deletedCommentId}`)
      .expect(204)
      .then(() => {
        return db.query(
          `SELECT * FROM comments
        WHERE comment_id = $1`,
          [deletedCommentId]
        );
      })
      .then((comment) => {
        expect(comment.rows).toHaveLength(0);
      });
  });
  it("responds with an error when comment type is invalid", () => {
    return request(app)
      .delete("/api/comments/one")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when comment type is valid, but comment does not exist", () => {
    return request(app)
      .delete("/api/comments/101")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("No comment with given id found");
      });
  });
});

describe("GET /api/users", () => {
  it("responds with an array of objects having the respective properties. Status code: 200", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        const users = res.body.users;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles?topic=topic_slug", () => {
  it("responds with an array of articles filtered by the topic value specified in the query. Status code: 200", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  it("responds with error when topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=dragons")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Topic does not exist");
      });
  });
  it("responds with empty array when given a topic that exists but there are no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toHaveLength(0);
      });
  });
});

describe("GET /api/articles?sort_by=any_valid_column apart from article_img_url", () => {
  it("responds with an array of article objects sorted by article_id. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  it("responds with an array of article objects sorted by title. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  it("responds with an array of article objects sorted by author. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  it("responds with an array of article objects sorted by topic. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("topic", { descending: true });
      });
  });
  it("responds with an array of article objects sorted by created_at. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  it("responds with an array of article objects sorted by votes. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });
  it("responds with error when passed invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=article_img_url")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("invalid given sort_by");
      });
  });
});

describe("GET /api/articles?order_by=asc_or_desc", () => {
  it("responds with an array of article objects sorted by ascending order. Status code: 200", () => {
    return request(app)
      .get("/api/articles?order_by=asc")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: false });
      });
  });
  it("responds with an array of article objects sorted by descending order. Status code: 200", () => {
    return request(app)
      .get("/api/articles?order_by=desc")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  it("it responds with an array of article objects sorted by author with ascending order. Status code: 200", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order_by=asc")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSortedBy("author", { descending: false });
      });
  });
  it("responds with error when passed invalid order_by", () => {
    return request(app)
      .get("/api/articles?order_by=ascending")
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("invalid given order_by");
      });
  });
});

describe("GET /api/users/:username", () => {
  it("responds with an user object with respective properties. Status code: 200", () => {
    request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((res) => {
        const user = res.body.user;
        expect(user).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  it("responds with error when username does not exist", () => {
    return request(app)
      .get("/api/users/girassol")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Username not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("responds with comment with updated votes using the respective comment_id. Status code: 200", () => {
    return request(app)
    .patch("/api/comments/5")
    .send({
      inc_votes: 5,
    })
    .expect(200)
    .then((res) => {
      const updatedComment = res.body.updatedComment;
      expect(updatedComment.votes).toBe(5);
    });
  })
  it("updates a given comment's votes by comment_id when inc_votes is negative", () => {
    return request(app)
      .patch("/api/comments/6")
      .send({
        inc_votes: -5,
      })
      .expect(200)
      .then((res) => {
        const updatedComment = res.body.updatedComment;
        expect(updatedComment.votes).toBe(-5);
      });
  });
  it("responds with an error when request body doesn't have inc_votes property", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({
        votes: 10,
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with an error when comment type is invalid", () => {
    return request(app)
      .patch("/api/comments/one")
      .send({
        inc_votes: 5,
      })
      .expect(400)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Bad request");
      });
  });
  it("responds with error when comment type is valid, but comment does not exist", () => {
    return request(app)
      .patch("/api/comments/101")
      .send({
        inc_votes: 5,
      })
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Comment id not found");
      });
  });
})

describe("invalid api endpoint", () => {
  it("responds with 404 status", () => {
    return request(app)
      .get("/api/tupacs")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Page not found");
      });
  });
});

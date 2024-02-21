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
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
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
        body: "So in love with this article"
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
        const err = res.body
        expect(err.msg).toBe("Bad request")
      })
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
        const err = res.body
        expect(err.msg).toBe("Incorrect username")
      })
  })
  it("responds with an error when article type is invalid", () => {
    return request(app)
      .post("/api/articles/one/comments")
      .send({
        username: "rogersop",
        body: "So in love with this article"
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
        body: "So in love with this article"
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
        inc_votes: 5
      })
      .expect(200)
      .then((res) => {
        const updatedArticle = res.body.updatedArticle
        expect(updatedArticle.votes).toBe(5)
      })
  });
  it("updates a given article's votes by article_id when inc_votes is negative", () => {
    return request(app)
      .patch("/api/articles/4")
      .send({
        inc_votes: -5
      })
      .expect(200)
      .then((res) => {
        const updatedArticle = res.body.updatedArticle
        expect(updatedArticle.votes).toBe(-5)
      })
  });
  it("responds with an error when request body doesn't have inc_votes property", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        votes: 10
      })
      .expect(400)
      .then((res) => {
        const err = res.body
        expect(err.msg).toBe("Bad request")
      })
  });
  it("responds with an error when article type is invalid", () => {
    return request(app)
      .patch("/api/articles/one")
      .send({
        inc_votes: 5
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
        inc_votes: 5
      })
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  });
})

describe("DELETE /api/comments/:comment_id", () => {
  it("responds with status 204 and no content", () => {
    return request(app)
    .delete("/api/comments/5")
    .expect(204)
    .then((res) => {
      const body = res.body
      expect(body).toEqual({})
    })
  })
  it("deletes given comment", () => {
    const deletedCommentId = 6;
    return request(app)
      .delete(`/api/comments/${deletedCommentId}`)
      .expect(204)
      .then(() => {
        return db.query(`SELECT * FROM comments
        WHERE comment_id = $1`, [deletedCommentId]);
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
        expect(err.msg).toBe("Comment id not found");
      });
  });
})

describe("GET /api/users", () => {
  it("responds with an array of objects having the respective properties. Status code: 200", () => {
    return request(app)
    .get("/api/users")
    .expect(200)
    .then((res) => {
      const users = res.body.users
      expect(users).toHaveLength(4)
      users.forEach(user => {
        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String)
        })
      })
    })
  })
  
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

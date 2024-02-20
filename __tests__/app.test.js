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
  it("responds with an array of comments for the given article_id. All comments have respective correct properties. Status code: 200", () => {
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
      .expect(201)
      .then((res) => {
        const comments = res.body.comments
        expect(comments).toHaveLength(0)
      });
  });
});

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

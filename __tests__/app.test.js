const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const fs = require("fs/promises");

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
        return fs.readFile("endpoints.json", "utf-8").then((data) => {
          const parsedEndpoints = JSON.parse(data);
          expect(description.description).toEqual(parsedEndpoints);
        });
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
  it('responds with error when article types is valid, but article does not exist', () => {
    return request(app)
      .get("/api/articles/101")
      .expect(404)
      .then((res) => {
        const err = res.body;
        expect(err.msg).toBe("Article id not found");
      });
  })
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

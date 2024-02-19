const app = require('../app.js');
const db = require('../db/connection.js')
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data/index.js');
const request = require('supertest');


beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api/topics', () => {
    it('responds with 200 status', () => {
        return request(app)
        .get("/api/topics")
        .expect(200)
    })
    it('responds with an array of topic objects with length 3', () => {
        return request(app)
        .get("/api/topics")
        .then((res) => {
            const topics = res.body.topics;
            expect(topics).toHaveLength(3);
        })
    })
    it('responds with an array of topic objects containing slug and description as porperties', () => {
        return request(app)
        .get("/api/topics")
        .then((res) => {
            const topics = res.body.topics;
            topics.forEach(topic => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String)
                })
            })
        })
    })
    it('responds with 404 status if invalid endpoint', () => {
        return request(app)
        .get("/api/tupacs")
        .expect(404)
        .then((res) => {
            const err = res.body
            expect(err.msg).toBe('Page not found')
        })
    })
})
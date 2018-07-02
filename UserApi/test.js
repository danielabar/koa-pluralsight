const app = require('./app');
const request = require('supertest').agent(app.listen());
const expect = require('chai').expect;

describe('Simple User Http Crud API', async (done) => {
  const a_user = {name: 'Joe', age: 42, height: 1.96};
  it('Adds a new user', async () => {
    try {
      const res = await request
        .post('/user')
        .send(a_user);
      expect(res.status).to.equal(201);
      expect(res.headers['Location']).to.match(/^\/user\/[0-9a-fA-F]{24}$/);
    } catch (err) {
      done(err);
    }
  });
});
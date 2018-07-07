const app = require('./app');
const users = require('./userRoutes').users;
const request = require('supertest').agent(app.listen());
const expect = require('chai').expect;
const _ = require('lodash');

afterEach(async () => {
  await users.remove();
});

describe('Simple User Http Crud API', async () => {
  it('Adds a new user', async () => {
    // Given
    const a_user = {name: 'Joe', age: 42, height: 1.96};
    // When
    const res = await request
      .post('/user')
      .send(a_user);
    // Then
    expect(res.status).to.equal(201);
    expect(res.headers['location']).to.match(/^\/user\/[0-9a-fA-F]{24}$/);
    expect(res.body.name).to.equal('Joe');
  });

  it('Fails with validationerror for users without name', async () => {
    // Given
    const a_user = {age: 50, height: 1.7};
    // When
    const res = await request
      .post('/user')
      .send(a_user);
    // Then
    expect(res.status).to.equal(400);
    expect(res.text).to.equal('name required');
  });

  it('Gets existing user by id', async () => {
    // Given
    const a_user = {name: 'JaneTest', age: 22, height: 1.36};
    const insertedUser = await users.insert(a_user);
    const locationUrl = `/user/${insertedUser._id}`;
    // When
    const res = await request
      .set('Accept', 'application/json')
      .get(locationUrl);
    // Then
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.match(/json/);
    expect(res.body.name).to.equal('JaneTest');
    expect(res.body.age).to.equal(22);
  });

  it('Updates an existing user', async () => {
    // Given
    const a_user = {name: 'JaneTest', age: 22, height: 1.36};
    const insertedUser = await users.insert(a_user);
    const u_user = _.cloneDeep(insertedUser);
    u_user.age = 23;
    const locationUrl = `/user/${insertedUser._id}`;
    // When
    const res = await request
      .put(locationUrl)
      .send(u_user);
    // Then
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('JaneTest');
    expect(res.body.age).to.equal(23);
  });

  it('Deletes an existing user', async() => {
    // Given
    const a_user = {name: 'JaneTest', age: 22, height: 1.36};
    const insertedUser = await users.insert(a_user);
    const locationUrl = `/user/${insertedUser._id}`;
    // When
    const res = await request
      .delete(locationUrl);
    // Then
    expect(res.status).to.equal(204);
    // Make sure its really gone
    const deletedUser = users.findOne({_id: insertedUser._id});
    expect(deletedUser).to.be.empty;
  });
});
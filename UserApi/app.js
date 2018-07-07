const Koa = require('koa');
const app = new Koa();
const routes = require('koa-route');
const parse = require('co-body');
const monk = require('monk');

const DB_NAME = process.env.DB_NAME || apiUsers;
const db = monk(`localhost:27017/${DB_NAME}`);
const users = db.get('users');

app.use(routes.post('/user', addUser));
app.use(routes.get('/user/:id', getUser));
app.use(routes.put('/user/:id', updateUser));
app.use(routes.delete('/user/:id', deleteUser));

async function addUser(ctx) {
  const userFromRequest = await parse(ctx);

  if (!userFromRequest.name) {
    ctx.throw(400, 'name required');
  }
  try {
    const insertedUser = await users.insert(userFromRequest);
    ctx.body = insertedUser;
    ctx.set('Location', `/user/${insertedUser._id}`);
    ctx.status = 201;
  } catch (err) {
    console.error(err);
    ctx.throw(500, 'unable to save user');
  }
}

async function getUser(ctx, id) {
  const user = await users.findOne({_id: id});
  if (!user) {
    ctx.throw(404, `no such user with id ${id}`);
  }
  ctx.body = user;
  ctx.status = 200;
}

async function updateUser(ctx, id) {
  try {
    const userFromRequest = await parse(ctx);
    const updatedUser = await users.findOneAndUpdate({_id: id}, userFromRequest);
    ctx.body = updatedUser;
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    ctx.throw(500, 'unable to update user');
  }
}

async function deleteUser(ctx, id) {
  try {
    await users.remove({_id: id});
    ctx.status = 204;
  } catch (err) {
    console.error(err);
    ctx.throw(500, 'unable to delete user');
  }
}

app.listen(3000);
console.log('The app is listening. Port 3000');

module.exports = {app, users};
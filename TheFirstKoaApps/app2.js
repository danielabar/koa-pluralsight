// Bring in koa framework
const Koa = require('koa');

// Create application by invoking koa function
const app = new Koa();

// Route middleware
const route = require('koa-route');

// Body parsing middleware
const parse = require('co-body');

// Create database using wrapper around Mongo driver
const db = require('monk')('localhost:27017/koa_users');

// Retrieve users collection from database
const users = db.get('users');

app.use(route.post('/user', saveUser));
app.use(route.get('/user/:id', getUser));

async function saveUser(ctx) {
  // parse the user from the sent request
  const userFromRequest = await parse(ctx.req);
  // store it in database
  const user = await users.insert(userFromRequest);
  // return status and resource
  ctx.body = user;
  ctx.set('Location', `/user/${user._id}`);
  ctx.status = 201; // CREATED OK
}

async function getUser(ctx, id) {
  const user = await users.findOne({_id: id});
  ctx.body = user;
  ctx.status = 200; // OK
}

// Specify which port to listen on
app.listen(3000);
console.log('The app is listening. Port 3000');
const Koa = require('koa');
const app = new Koa();

// Define middleware to include response time in header
async function setResponseTime(ctx, next) {
  console.log('=== setResponseTime middleware starting...');
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `ms ${ms}`);
  console.log('=== setResponseTime middleware finished');
}

// Define middleware to log response time
async function consoleLogger(ctx, next) {
  console.log('=== consoleLogger middleware starting...');
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} took ${ms} ms`);
  console.log('=== consoleLogger middleware finished');
}

// Register middlewares
app.use(setResponseTime);
app.use(consoleLogger);

// When / request is invoked, registered middlewares will run
app.use((ctx) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
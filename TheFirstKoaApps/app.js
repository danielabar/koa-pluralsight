// Bring in koa framework
const Koa = require('koa');
// Create application by invoking koa function
const app = new Koa();

// Use app created above to define middleware
// Asterisk indicates this function is a generator function
// app.use(function * () {
//   this.body = 'Hello World!';
// });
app.use(ctx => {
  ctx.body = 'Hello World!';
});

// Specify which port to listen on
app.listen(3000);
console.log('The app is listening. Port 3000');
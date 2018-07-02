const Koa = require('koa');
const app = new Koa();

app.listen(3000);
console.log('The app is listening. Port 3000');

module.exports = app;
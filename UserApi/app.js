const Koa = require('koa');
const app = new Koa();
const routes = require('koa-route');

const userRoutes = require('./userRoutes.js');
app.use(routes.post('/user', userRoutes.addUser));
app.use(routes.get('/user/:id', userRoutes.getUser));
app.use(routes.put('/user/:id', userRoutes.updateUser));
app.use(routes.delete('/user/:id', userRoutes.deleteUser));

app.listen(3000);
console.log('The app is listening. Port 3000');

module.exports = app;
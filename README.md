<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Introduction to Koa](#introduction-to-koa)
  - [Intro](#intro)
    - [First Applications](#first-applications)
  - [Understanding Yield and Generators](#understanding-yield-and-generators)
    - [Intro](#intro-1)
    - [What Can I Use This For](#what-can-i-use-this-for)
    - [Error Handling](#error-handling)
  - [Koa Concepts](#koa-concepts)
    - [The Application Object](#the-application-object)
    - [The Request Object](#the-request-object)
    - [The Response Object](#the-response-object)
    - [The Context Object](#the-context-object)
  - [Building an HTTP API With Koa](#building-an-http-api-with-koa)
    - [The First Method - Create New Users](#the-first-method---create-new-users)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Introduction to Koa

> My notes from this [Pluralsight course](https://app.pluralsight.com/library/courses/javascript-koa-introduction/table-of-contents)

Course is using Koa 1.x with generator functions and yield. At time of taking this course, Koa is on 2.x and generator functions are deprecated in favor of async/await.

## Intro

Benefits of Koa:
- minimalistic - framework stays out of your way, relies heavily on middleware to put together features you need for your app
- no calbacks - uses generators, reads sequentially but still non blocking async
- created by express developers

### First Applications

Trivial simple hello world [demo](TheFirstKoaApps/app.js):

```shell
take The FirstKoaApps
npm init #fill in some values for demo
npm i koa --save
touch app.js
```

Note use of *generator function* for middleware, but newer version of koa uses async/await

```javascript
// app.js
// Bring in koa framework
const koa = require('koa');
// Create application by invoking koa function
const app = koa();

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
```

Start app:

```shell
node app.js
```

A more fully featured example - HTTP API. Store user information and then retrieve by id.

[App](TheFirstKoaApps/app2.js)

Startup MongoBD, then run app:

```shell
docker pull mongo:4.0.0
docker run -p 27017:27017 --name koa-mongo -d mongo:4.0.0
node app2.js
```

## Understanding Yield and Generators

### Intro

Sipmle [Example 1](generators/example1.js).

Generator functions marked by `*` and do not return. They `yield`, remember where they left off. eg, function that yields a sequence:

```javascript
function *allTheEvenIntegers() {
  let i = 0;
  while (true) {
    yield i;
    i += 2;
  }
}
```

To invoke this function, create an instance, then call `next`:

```javascript
var evens = allTheEvenIntegers();
// get next value in sequence
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
```

To run it:

```shell
node example1.js
```

Output - output of `next` function is an object containing `value` property and `done` boolean indicating if there are more values in the sequence. In this example, `done` is always false because the sequence continues infinitely.

```shell
{ value: 0, done: false }
{ value: 2, done: false }
{ value: 4, done: false }
{ value: 6, done: false }
{ value: 8, done: false }
```

### What Can I Use This For

[Example 2](generators/example2.js)

In this example, the generator function yields three different values in turn:

```javascript
function *differentStuff () {
  yield 21;
  yield {name: 'Marcus', age: 42, kids: ['Albert', 'Jane']};
  yield 'A string with data in it';
}

const f = differentStuff();

console.log(f.next());
console.log(f.next());
console.log(f.next());
console.log(f.next());
```

Output, note on fourth call when there's nothing left to yield, `done` is true, this means we've reached end of sequence:

```shell
{ value: 21, done: false }
{ value: { name: 'Marcus', age: 42, kids: [ 'Albert', 'Jane' ] }, done: false }
{ value: 'A string with data in it', done: false }
{ value: undefined, done: true }
```

Basically generator function says to caller, when you want the next value, *call me back*. i.e. similar functionality to callbacks, but without the nested callback hell.

[Koa Example Middleware](generators/koa-example.js)

```javascript
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
```

When `next()` is encountered, tells Koa to run next middleware, and will continue execution from that point when next middleware is complete. Final middleware is application itself, which sets body and returns. This sends control back to middlewares. When there are no more middlewares to execute entire response is returned.

Hitting `http://localhost:3000` in browser outputs to console:

```shell
=== setResponseTime middleware starting...
=== consoleLogger middleware starting...
GET / took 1 ms
=== consoleLogger middleware finished
=== setResponseTime middleware finished
```

### Error Handling

Use try/catch. In Koa, if no try/catch used in custom middleware or app, one is supplied for you that returns Server Error 500.

## Koa Concepts

Application object used to configure application.

Context object is encapsulation of Request and Response.

###  The Application Object

To create Application object:

```javascript
const Koa = require('koa);
const app = new Koa();
// for testing purposes, also expose app object to other modules:
module.exports = Koa;
```

One liner: `const app = module.exports = require('koa)();`

`listen` function starts up app listening on given port number:

```javascript
const app = require('koa)();
app.listen(3000);
console.log('The app is running. And listening on port 3000');
```

`use` function is how Koa includes and uses middleware.

Koa apps built by composing lots of smaller middleware. Middleware can be very small such as single line function to log incoming request to console:

```javascript
const app = require('koa')();
app.use(ctx => {
  console.dir(ctx.request);
});
```

Use `.use` function multiple times to use multiple middlewares, eg: to make use of a logger:

```javascript
const app = require('koa')();
const logger = require('koa-logger');

app.use(logger());
app.use(ctx => {
  ctx.body = 'Hello World';
});
app.listen(3000);
console.log('The app is running on port 3000);
```

Can also write a custom logger that logs before and after request by running code before and after await, using `next` argument provided by Koa:

```javascript
const app = require('koa')();

app.use(async (ctx, next) => {
  console.log('Before');
  await next();
  console.log('After');
});

app.use(ctx => {
console.log('In application');
ctx.body = 'I\'ve been logged';
});

app.listen(3000);
```

**Summary of Application Object**

`const app = require('koa')()`

`app.use(/* middleware */);`

`app.listen(4321);`

### The Request Object

Koa Request object is a wrapper around incoming HTTP request object. Can be retrieved from Context:

```javascript
app.use(ctx => {
  const r = this.request;
});
```

Useful properties of request object include:

- request.header
- request.method (GET, POST, etc)
- request.url (url request came from)
- request.path
- request.querystring

Any of the above can also be set, eg: `reqesut.header = ''`.

Useful functions of request object include:

`request.is('json')` or `request.is('html')` to determine what kind of content is coming in with the request

Use `accepts` function to do content negotation, eg if your api accepts and handles different content types:

```javascript
switch (this.request.accepts('json', 'html', 'text)) {
  case 'json': break;
  case 'html': break;
  case 'text': break;
  default: this.throw(406, 'json, html, or text only');
}
```

If you need access to raw Node Request Object:

```javascript
const app = require('koa')();
app.use(ctx => {
  console.log(this.request); // koa wrapper
  console.log(this.request.req); // node request
});
app.listen(3000);
```

### The Response Object

Representation of HTTP response sent back to client. Also a wrapper around raw Node response object.

Access it via Context, just like response:

```javascript
app.use(this => {
  const r = this.response;
});
```

Useful properties include:

- `response.body = {name: 'Marcus'};` to set response body.
- `response.status = 418` to set http response status code (Koa automatically will add response text, eg 418 - I'm a teapot). If set an invalid response code, Koa will throw an error.
- `response.type = 'application/json'` to set response content type.

Useful functions include:
`response.set('Location', '/user/123')` to set a response header. Can also pass in a json object to set several headers at once:

```javascript
response.set({
  'Etag': '234',
  'Last-Modified': new Date()
});
```

Redirect to send 302 Moved Temporarily to caller:

```javascript
response.redirect('http://some.place.net');
```

To get raw Node response object:

```javascript
const app = require('koa')();
app.use(ctx => {
  console.log(this.response); // koa wrapper
  console.log(this.response.res); // node response
});
app.listen(3000);
```

### The Context Object

To avoid using `this.request/response`. Context object shadows and wraps all useful response/response methods.

```javascript
const method = ctx.method;
ctx.is('html');
ctx.bdoy = {foo: 'bar'};
```

## Building an HTTP API With Koa

Will build simple CRUD HTTP API, this is Koa's sweet spot. Initial setup:

```shell
take UserApi
npm init
touch app.js
touch test.js
npm i --save koa
```

Add start script in `package.json`:

```javascript
"scripts": {
  "start": "nodemon app.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

Then can start app with `npm start`.

### The First Method - Create New Users

Will use TDD approach, testing entire stack, using mocha and supertest. [test.js](UserApi/test.js).

Testing is donen in-memory, no need to start server, since `app` object is exposed by `app.js`:

```javascript
// test.js
const app = require('./app');
const request = require('supertest').agent(app.listen());
...
```

To run the tests:

```shell
./node_modules/mocha/bin/mocha -u bdd -R spec --exit
```

Left off at 4:06
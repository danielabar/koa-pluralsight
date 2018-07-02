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
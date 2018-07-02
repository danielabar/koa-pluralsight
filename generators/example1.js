function* allTheEvenIntegers() {
  let i = 0;
  while (true) {
    yield i;
    i += 2;
  }
}

var evens = allTheEvenIntegers();
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
console.log(evens.next());
const curry = require('./curry')

// identity :: a -> a
const identity = x => x

// constant :: a -> b -> a
function constant(x, y) {
  return x
}

// flip :: (b -> a -> c) -> (a -> b -> c)
function flip(f, b, a) {
  return f(a)(b)
}

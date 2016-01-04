export default function computation(target, key, desc) {
  var value = desc.value; // original func
  desc.value = function () {
    m.startComputation();
    m.redraw.strategy("diff");
    var isPromise = false;
    try {
      var results = value.apply(this, arguments);
      if (results && results.then) {
        isPromise = true;
        return results.then((content) => {
          m.endComputation();
          return content;
        });
      }
      return results;
    } finally {
      if (!isPromise) m.endComputation();
    }
  };
  return desc;
}

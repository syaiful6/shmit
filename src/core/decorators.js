export default function computation(target, key, desc) {
  var value = desc.value; // original func
  desc.value = function () {
    m.startComputation();
    var results = value.apply(this, arguments);
    if (results && results.then) {
      return results.then((content) => {
        m.endComputation();
        return content;
      });
    }
    m.endComputation();
    return results;
  };
  return desc;
}

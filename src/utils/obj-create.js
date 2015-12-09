export default Object.create || function (proto) {
  function __dummy__() {}
  __dummy__.prototype = proto;
  return new __dummy__();
};

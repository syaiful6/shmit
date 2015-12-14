export function merge(original, updates) {
  if (!updates || typeof updates !== 'object') {
    return original;
  }

  var props = Object.keys(updates);
  var prop;
  var length = props.length;

  for (var i = 0; i < length; i++) {
    prop = props[i];
    original[prop] = updates[prop];
  }

  return original;
}

export default merge;

var _isArray;

if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

export var isArray = _isArray;

var Vertex = (function () {
  function Vertex () {
    this.name = name;
    this.incoming = {};
    this.incomingNames = [];
    this.hasOutgoing = false;
    this.value = null;
  }
  return Vertex;
})();

export var DAGMap = (function () {

  var visit = function(vertex, fn, visited, path) {
    var name = vertex.name;
    var vertices = vertex.incoming;
    var names = vertex.incomingNames;
    var len = names.length;
    var i;

    if (!visited) {
      visited = {};
    }
    if (!path) {
      path = [];
    }
    if (visited.hasOwnProperty(name)) {
      return;
    }
    path.push(name);
    visited[name] = true;
    for (i = 0; i < len; i++) {
      visit(vertices[names[i]], fn, visited, path);
    }
    fn(vertex, path);
    path.pop();
  };

  function DAGMap() {
    this.names = [];
    this.vertices = Object.create(null);
  }

  DAGMap.prototype.add = function(name) {
    if (!name) {
      throw new Error("Can't add Vertex without name");
    }
    if (this.vertices[name] !== undefined) {
      return this.vertices[name];
    }
    var vertex = new Vertex(name);
    this.vertices[name] = vertex;
    this.names.push(name);
    return vertex;
  };

  DAGMap.prototype.map = function(name, value) {
    this.add(name).value = value;
  };

  DAGMap.prototype.addEdge = function(fromName, toName) {
    if (!fromName || !toName || fromName === toName) {
      return;
    }
    var from = this.add(fromName);
    var to = this.add(toName);
    if (to.incoming.hasOwnProperty(fromName)) {
      return;
    }
    function checkCycle(vertex, path) {
      if (vertex.name === toName) {
        throw new Error("cycle detected: " + toName + " <- " + path.join(" <- "));
      }
    }
    visit(from, checkCycle);
    from.hasOutgoing = true;
    to.incoming[fromName] = from;
    to.incomingNames.push(fromName);
  };


  DAGMap.prototype.topsort = function(fn) {
    var visited = {};
    var vertices = this.vertices;
    var names = this.names;
    var len = names.length;
    var i, vertex;

    for (i = 0; i < len; i++) {
      vertex = vertices[names[i]];
      if (!vertex.hasOutgoing) {
        visit(vertex, fn, visited);
      }
    }
  };

  DAGMap.prototype.addEdges = function(name, value, before, after) {
    var i;
    this.map(name, value);
    if (before) {
      if (typeof before === 'string') {
        this.addEdge(name, before);
      } else {
        for (i = 0; i < before.length; i++) {
          this.addEdge(name, before[i]);
        }
      }
    }
    if (after) {
      if (typeof after === 'string') {
        this.addEdge(after, name);
      } else {
        for (i = 0; i < after.length; i++) {
          this.addEdge(after[i], name);
        }
      }
    }
  };

  return DAGMap;
})();

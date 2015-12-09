/**
* Cross-browser event handlers
*/
export default function addEvent(obj, evType, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(evType, fn, false);
    return true;
  } else if (obj.attachEvent) {
    // IE
    var r = obj.attachEvent("on" + evType, fn);
    return r;
  } else {
    // fail :(
    return false;
  }
}

export function removeEvent(obj, evType, fn) {
  if (obj.removeEventListener) {
    obj.removeEventListener(evType, fn, false);
    return true;
  } else if (obj.detachEvent) {
    obj.detachEvent("on" + evType, fn);
    return true;
  } else {
    return false;
  }
}

export function cancelEventPropagation(e) {
  if (!e) {
    e = window.event;
  }
  e.cancelBubble = true;
  if (e.stopPropagation) {
    e.stopPropagation();
  }
}

// create custom event
export function customEvent(type, args) {
  var event;
  if (window.CustomEvent) {
    event = new window.CustomEvent(type, {detail: args});
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, args);
  }
  return event;
}

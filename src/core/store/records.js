import defineAction, {handleActions} from '../../tranflux/actions';
import request, {urlFormEncode} from '../../utils/request';
import path from '../services/path';

export const FIND_RECORDS = 'FIND_RECORDS';
export const QUERY_RECORDS = 'QUERY_RECORDS';
export const SAVE_RECORD = 'SAVE_RECORD';
export const PUSH_RECORDS = 'PUSH_RECORDS';

var URLBuilder = path().url;

function makeRequest(url, options) {
  options = Object.assign({
    method: 'GET',
    headers: {
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json"
    }
  }, options);

  return request(url, options).then(JSON.parse);
}

export function findURL(type, ids) {
  var url = URLBuilder.api(type);
  if (Array.isArray(ids)) {
    url += '?' + ids.map((id) => `ids[]=${id}`).join('&');
  } else {
    url = URLBuilder.join(url, ids.toString());
  }
  return url;
}

export function queryURL(type, query) {
  var url = URLBuilder.api(type),
    params = urlFormEncode(query);

  return `${url}?${params}`;
}

export function saveURL(record) {
  var url = URLBuilder.api(record.type);
  if (typeof record.id !== 'undefined') {
    let identifier = record.id;
    url = URLBuilder.join(url, identifier.toString());
  }
  return url;
}

export var findRecords = defineAction(
  FIND_RECORDS,
  function (type, ids, options = {}) {
    var url = findURL(type, ids);
    return makeRequest(url, options);
  }
);

export var queryRecords = defineAction(
  QUERY_RECORDS,
  function (type, query, options = {}) {
    var url = queryURL(type, query);
    return makeRequest(url, options);
  }
);

export var saveRecord = defineAction(
  SAVE_RECORD,
  function (record, options = {}) {
    options = Object.assign({
      method: typeof record.id !== 'undefined' ? 'PATCH' : 'POST',
      data: JSON.stringify({data: record})
    }, options);
    var url = saveURL(record);
    return makeRequest(url, options);
  }
);

export var pushRecords = defineAction(PUSH_RECORDS, function (data) {
  return data;
});

var reducers = {};

reducers[FIND_RECORDS] = {
  next: function (state, action) {
    var payload = Object.assign({}, action.payload),
      records = Object.assign({}, state);
    if (Array.isArray(payload.data)) {
      payload.data.forEach((record) => {
        var type = records[record.type] = records[record.type] || {};
        type[record.id] = record;
      });
    } else {
      var type = records[payload.data.type] = records[payload.data.type] || {};
      type[payload.data.id] = payload.data;
    }
    return records;
  },
  'throw': function (state) {
    return state;
  }
};

reducers[PUSH_RECORDS] = reducers[SAVE_RECORD] = reducers[QUERY_RECORDS] = reducers[FIND_RECORDS];

export default handleActions(reducers, {});

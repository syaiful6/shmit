import Model, {URLBuilder, Store} from 'shopie/core/model';
import User from 'shopie/auth/models/user';

describe('url builder specs', function() {
  var builder = new URLBuilder();

  it('return specific resource url if passed non array ids', function () {
    var url = builder.findURL('products', 1);
    expect(url).toEqual('/api/v1/products/1/');
  });

  it('return multile id resource if passed array ids', function () {
    var url = builder.findURL('products', [1,2,3]);
    expect(url).toEqual('/api/v1/products/?ids[]=1&ids[]=2&ids[]=3')
  });

  it('query url return query params url', function () {
    var url = builder.queryURL('products', {page: 1, limit: 10});
    expect(url).toEqual('/api/v1/products/?page=1&limit=10');
  });
});

describe('model spec', function () {
  var payload = {},
    store;

  beforeEach(() => {
    payload = {
      "data": [
        {
          "type": "users",
          "id": "1",
          "attributes": {
            "first-name": "Hip",
            "last-name": "Hop",
            "email": "name@domain.com",
            "username": "the username",
            "date-joined": "2015-12-15T04:47:16.600760Z"
          }
        }
      ],
      "meta": {
        "pagination": {
          "page": 1,
          "pages": 1,
          "count": 1
        }
      }
    };

    store = new Store({
      users: User
    });
  });

  afterEach(() => {
    payload = {};
    store = null;
  });

  it('store push payload', function () {
    store.pushPayload(payload);
    var record = store.peekRecord('users', 1);
    expect(record).toBeDefined();
    expect(record.toJSON).toBeDefined();
  });

  it('model attribute work', function () {
    store.pushPayload(payload);
    var record = store.peekRecord('users', 1);
    expect(record.firstName).toEqual('Hip');
    expect(record.lastName).toEqual('Hop');
  });

  it('model attribute descriptor forward to data attributes', function () {
    store.pushPayload(payload);
    var record = store.peekRecord('users', 1);
    record.firstName = 'Rock';
    expect(record.firstName).toEqual('Rock');
    expect(record.data.attributes['first-name']).toEqual('Rock');
  });

  it('endpoint to resource id when model exists', function () {
    store.pushPayload(payload);
    var record = store.peekRecord('users', 1);

    expect(record.endpoint()).toEqual('/api/v1/users/1/');
  });
});

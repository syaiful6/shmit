import Model, {Store} from 'shopie/core/model';
import User from 'shopie/core/models/user';

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
});

import {Store} from '../core/model';
import User from '../core/models/user';

export default {
  name: 'application-store:main',
  initialize(app) {
    var store = new Store({
      users: User
    });
    app.register('store', store);
  }
};

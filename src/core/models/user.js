import Model, {attr} from '../model';
import inherits, {assign} from '../../utils/inherits';

export default (function (BaseModel) {
  function User() {
    BaseModel.apply(this, arguments);
  }

  inherits(User, BaseModel);

  Object.defineProperties(User.prototype, {
    firstName: attr('first-name'),
    lastName: attr('last-name'),
    email: attr('email'),
    username: attr('username'),
    dateJoined: attr('date-joined')
  });

  return User;
})(Model);

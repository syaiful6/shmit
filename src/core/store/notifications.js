import defineAction, {handleActions} from '../../tranflux/actions';

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';
export const CLOSE_ALL_NOTIFICATIONS = 'CLOSE_ALL_NOTIFICATIONS';

export var showNotification = defineAction(ADD_NOTIFICATION, (message, options) => {
  return {
    message,
    type: options.type,
    delayed: !!options.delayed
  };
});

export var closeNotification = defineAction(CLOSE_NOTIFICATION, (id) => {
  return { id };
});

export var closeAllNotifications = defineAction(CLOSE_ALL_NOTIFICATIONS);

var reducers = {};
reducers[ADD_NOTIFICATION] = function (state, action) {
  return [
    ...state,
    {
      id: state.reduce((maxId, notif) => Math.max(notif.id, maxId), -1) + 1,
      message: action.payload.message,
      type: action.payload.type,
      delayed: action.payload.delayed
    }
  ];
};

reducers[CLOSE_NOTIFICATION] = function (state, action) {
  return state.filter(notif => notif.id !== action.payload.id);
}

reducers[CLOSE_ALL_NOTIFICATIONS] = function () {
  return [];
}

export default handleActions(reducers, []);


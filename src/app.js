import Application from './core/application';
import loadInitializer from './core/load-initializers';

var app = new Application();
loadInitializer(app, 'shopie');

app.boot().then(() => {
  //pass
});

export default app;

/* global require, module, escape */
'use strict';

var babel = require('broccoli-babel-transpiler'),
  es6Modules = require('broccoli-es6modules'),
  uglifyJavaScript = require('broccoli-uglify-js'),
  es3SafeRecast   = require('broccoli-es3-safe-recast'),
  stew            = require('broccoli-stew'),
  pickFiles = require('broccoli-funnel'),
  mergeTrees = require('broccoli-merge-trees'),
  findBowerTrees = require('broccoli-bower'),
  env = require('broccoli-env').getEnv(),
  concat = require('broccoli-sourcemap-concat'),
  myth = require('broccoli-myth'),
  path = require('path'),
  escapeChar     = process.platform.match(/^win/) ? '^' : '\\',
  cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),
  extension = env === 'production' ? '.min.js' : '.js';

var babelOptions = {
  loose: true,
  sourceMaps: false,
  modules: 'amdStrict',
  moduleIds: true,
  resolveModuleSource: moduleResolve
};

function merge(original, updates) {
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

function moduleResolve(child, name) {
  if (child.charAt(0) !== '.') { return child; }

  var parts = child.split('/');
  var nameParts = name.split('/');
  var parentBase = nameParts.slice(0, -1);

  for (var i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];

    if (part === '..') {
      if (parentBase.length === 0) {
        throw new Error('Cannot access parent module of root');
      }
      parentBase.pop();
    } else if (part === '.') {

      continue;
    } else { parentBase.push(part); }
  }

  return parentBase.join('/');
}
var app = 'src';
app = babel(pickFiles(app, {
  srcDir: '/',
  destDir: 'shopie'
}), merge(babelOptions, {jsxPragma: 'm'}));

app = es3SafeRecast(app);

var specs = 'specs';

specs = babel(pickFiles(specs, {
  src: '/',
  destDir: 'shopie/specs'
}), babelOptions);

var vendor = 'vendor';

vendor = pickFiles(vendor, {
  src: '/',
  destDir: 'libs'
});


var sourceTree = [app, vendor];

if (env !== 'production') {
  sourceTree.push(specs);
}

sourceTree = mergeTrees(sourceTree);

var appJs = concat(sourceTree, {
  inputFiles: ['shopie/**/*.js'],
  outputFile: 'shopie.js',
  sourceMapConfig: { enabled: env !== 'production' },
  headerFiles: ['libs/shim.js'],
  footerFiles: ['libs/start.js']
});

if (env === 'production') {
  // minify js
  appJs = uglifyJavaScript(appJs, {
    // mangle: false,
    // compress: false
  })
}

var bower = 'bower_components';
bower = pickFiles(bower, {
  srcDir: '/',
  destDir: 'bower'
});

var babelPath = require.resolve('broccoli-babel-transpiler');
babelPath = babelPath.replace(/\/index.js$/, '');
babelPath += '/node_modules/babel-core';

var browserPolyfill = funnel(babelPath, {
  files: ['browser-polyfill.js']
});

var vendorTree = concat(bower, {
  inputFiles: [
    'bower/loader.js/loader.js',
    'bower/mithril/mithril' + extension,
    'bower/es6-promise/promise' + extension
  ],
  sourceMapConfig: { enabled: env !== 'production' },
  outputFile: 'vendor.js'
});

vendorTree = mergeTrees([browserPolyfill, vendorTree]);

if (env === 'production') {
  vendorTree = uglifyJavaScript(vendorTree, {

  });
}

var styles = 'src/styles';
styles = myth(pickFiles(styles, {
  srcDir: '/',
  files: ['app.css']
}), {
  source: path.resolve(cwd, 'src/styles/app.css'),
  inputFile: 'app.css',
  outputFile: 'app.css',
  compress: env === 'production'
});

var rename = stew.rename;

styles = rename(styles, 'app', 'shopie');

module.exports = mergeTrees([appJs, vendorTree, styles]);

'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

require('babel-polyfill');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongodb = require('mongodb');

var _issue = require('./issue.js');

var _issue2 = _interopRequireDefault(_issue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_sourceMapSupport2.default.install();
var app = (0, _express2.default)();
app.use(_express2.default.static('static'));
app.use(_bodyParser2.default.json());

if (process.env.NODE_ENV !== 'production') {
  var webpack = require('webpack');
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');

  var config = require('../webpack.config');
  config.entry.app.push('webpack-hot-middleware/client', 'webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  var bundler = webpack(config);
  app.use(webpackDevMiddleware(bundler, { noInfo: true }));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}

app.get('/api/issues', function (req, res) {
  var filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
  if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);

  if (req.query._summary === undefined) {
    var page = req.query._page ? parseInt(req.query._page, 10) : 1;
    var limit = req.query._size ? parseInt(req.query._size, 10) : 20;
    if (limit > 50) limit = 50;
    if (page < 0 || page === 0) {
      page = 1;
    }
    var skip = limit * (page - 1);
    var cursor = db.collection('issues').find(filter).sort({ _id: 1 }).skip(skip).limit(limit);

    var totalCount = void 0;

    db.collection('issues').count().then(function (result) {
      totalCount = result;
      return cursor.toArray();
    }).then(function (issues) {
      res.json({ _metadata: { totalCount: totalCount }, records: issues });
    }).catch(function (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error: ' + error });
    });
  } else {
    db.collection('issues').aggregate([{ $match: filter }, { $group: { _id: { owner: '$owner', status: '$status' }, count: { $sum: 1 } } }]).toArray().then(function (results) {
      var stats = {};
      results.forEach(function (result) {
        if (!stats[result._id.owner]) stats[result._id.owner] = {};
        stats[result._id.owner][result._id.status] = result.count;
      });
      res.json(stats);
    }).catch(function (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error: ' + error });
    });
  }
});

app.get('/api/issues/:id', function (req, res) {
  var issueId = void 0;
  try {
    issueId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: 'Invalid issue ID format: ' + error });
    return;
  }

  db.collection('issues').find({ _id: issueId }).limit(1).next().then(function (issue) {
    if (!issue) res.status(404).json({ message: 'No such issue: ' + issueId });else res.json(issue);
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error: ' + error });
  });
});

app.post('/api/issues', function (req, res) {
  var newIssue = req.body;
  newIssue.created = new Date();
  if (!newIssue.status) newIssue.status = 'New';

  var err = _issue2.default.validateIssue(newIssue);
  if (err) {
    res.status(422).json({ message: 'Invalid request: ' + err });
    return;
  }

  db.collection('issues').insertOne(_issue2.default.cleanupIssue(newIssue)).then(function (result) {
    return db.collection('issues').find({ _id: result.insertedId }).limit(1).next();
  }).then(function (newIssue) {
    res.json(newIssue);
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error: ' + error });
  });
});

app.get('*', function (req, res) {
  res.sendFile(_path2.default.resolve('./static/index.html'));
});

app.put('/api/issues/:id', function (req, res) {
  var issueId = void 0;
  try {
    issueId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: 'Invalid issue ID format: ' + error });
    return;
  }

  var issue = req.body;
  delete issue._id;

  var err = _issue2.default.validateIssue(issue);
  if (err) {
    res.status(422).json({ message: 'Invalid request: ' + err });
    return;
  }

  db.collection('issues').update({ _id: issueId }, _issue2.default.convertIssue(issue)).then(function () {
    return db.collection('issues').find({ _id: issueId }).limit(1).next();
  }).then(function (savedIssue) {
    res.json(savedIssue);
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error: ' + error });
  });
});

app.delete('/api/issues/:id', function (req, res) {
  var issueId = void 0;
  try {
    issueId = new _mongodb.ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: 'Invalid Issue ID format: ' + error });
    return;
  }

  db.collection('issues').deleteOne({ _id: issueId }).then(function (deleteResult) {
    if (deleteResult.result.n === 1) res.json({ status: 'OK' });else res.json({ status: 'Warning: object not found' });
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error: ' + error });
  });
});

var db = void 0;
_mongodb.MongoClient.connect('mongodb://localhost').then(function (connection) {
  db = connection.db('issuetracker');
  app.listen(3000, function () {
    console.log('App started on port 3000');
  });
}).catch(function (error) {
  console.log('ERROR:', error);
});
//# sourceMappingURL=server.js.map
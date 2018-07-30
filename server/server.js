import path from 'path';  
import SourceMapSupport from 'source-map-support';
import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient, ObjectId } from 'mongodb';
import Issue from './issue.js';


SourceMapSupport.install();
const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const config = require('../webpack.config');
  config.entry.app.push('webpack-hot-middleware/client', 'webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const bundler = webpack(config);
  app.use(webpackDevMiddleware(bundler, { noInfo: true }));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}

app.get('/api/issues', (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
  if (req.query.effort_lte) filter.effort.$lte = parseInt(req.query.effort_lte, 10);
  if (req.query.effort_gte) filter.effort.$gte = parseInt(req.query.effort_gte, 10);
  
  
  if (req.query._summary === undefined) {
    let page = req.query._page ? parseInt(req.query._page, 10) : 1;
    let limit = req.query._size ? parseInt(req.query._size, 10) : 20;
    if (limit > 50) limit = 50;
    if (page < 0 || page === 0) {
      page = 1;
    }
    let skip = limit * (page - 1);
    const cursor = db.collection('issues').find(filter).sort({ _id: 1 }).skip(skip).limit(limit);
    
    let totalCount;
    
    db.collection('issues').count().then(result => {
      totalCount = result;
      return cursor.toArray();
    }).then(issues => {
      res.json({ _metadata: { totalCount }, records: issues });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` });
    });
  } else {
    db.collection('issues').aggregate([
      { $match: filter },
      { $group: { _id: { owner: '$owner', status: '$status' }, count: { $sum: 1 } } },
    ]).toArray()
    .then(results => {
      const stats = {};
      results.forEach(result => {
        if (!stats[result._id.owner]) stats[result._id.owner] = {};
        stats[result._id.owner][result._id.status] = result.count;
      });
      res.json(stats);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: `Internal Server Error: ${error}` }); 
    });
  }
});
  
app.get('/api/issues/:id', (req,res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({message: `Invalid issue ID format: ${error}`});
    return;
  }
  
  db.collection('issues').find({_id: issueId }).limit(1).next().then(issue => {
    if (!issue) res.status(404).json({ message: `No such issue: ${issueId}`});
    else res.json(issue);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});
     
app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  newIssue.created = new Date();
  if (!newIssue.status)
    newIssue.status = 'New';

  const err = Issue.validateIssue(newIssue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}` });
    return;
  }

  db.collection('issues').insertOne(Issue.cleanupIssue(newIssue)).then(result =>
    db.collection('issues').find({ _id: result.insertedId }).limit(1).next()
  ).then(newIssue => {
    res.json(newIssue);
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

app.get('*', (req,res) => {
  res.sendFile(path.resolve('./static/index.html'));
});

app.put('/api/issues/:id', (req, res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid issue ID format: ${error}` });
    return;
  }
  
  const issue = req.body;
  delete issue._id;
  
  const err = Issue.validateIssue(issue);
  if (err) {
    res.status(422).json({ message: `Invalid request: ${err}`});
    return;
  }
  
  db.collection('issues').update({ _id: issueId }, Issue.convertIssue(issue)).then(
    () => db.collection('issues').find({ _id: issueId }).limit(1).next()
  ).then(savedIssue => { res.json(savedIssue); }).catch(error => {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
  
});

app.delete('/api/issues/:id', (req,res) => {
  let issueId;
  try {
    issueId = new ObjectId(req.params.id);
  } catch (error) {
    res.status(422).json({ message: `Invalid Issue ID format: ${error}` });
    return;
  }
  
  db.collection('issues').deleteOne({ _id: issueId }).then((deleteResult) => {
    if (deleteResult.result.n === 1) res.json({ status: 'OK'});
    else res.json({ status: 'Warning: object not found' });
  }).catch(error =>{
    console.log(error);
    res.status(500).json({ message: `Internal Server Error: ${error}` });
  });
});

let db;
MongoClient.connect('mongodb://localhost').then(connection => {
  db = connection.db('issuetracker');
  app.listen(3000, () => {
    console.log('App started on port 3000');
  });
}).catch(error => {
  console.log('ERROR:', error);
});

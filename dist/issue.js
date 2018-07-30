'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true,
  Verified: true,
  Closed: true
};

var issueFieldType = {
  status: 'required',
  owner: 'required',
  effort: 'optional',
  created: 'required',
  completionDate: 'optional',
  title: 'required'
};

function cleanupIssue(issue) {
  var cleanedUpIssue = {};
  Object.keys(issue).forEach(function (field) {
    if (issueFieldType[field]) cleanedUpIssue[field] = issue[field];
  });
  return cleanedUpIssue;
}

function validateIssue(issue) {
  var errors = [];
  Object.keys(issueFieldType).forEach(function (field) {
    if (issueFieldType[field] === 'required' && !issue[field]) {
      errors.push('Missing mandatory field: ' + field);
    }
  });

  if (!validIssueStatus[issue.status]) {
    errors.push(issue.status + ' is not a valid status.');
  }

  return errors.length ? errors.join('; ') : null;
}

function convertIssue(issue) {
  if (issue.created) issue.created = new Date(issue.created);
  if (issue.completion) issue.completionDate = new Date(issue.completionDate);
  return cleanupIssue(issue);
}

exports.default = {
  validateIssue: validateIssue,
  cleanupIssue: cleanupIssue,
  convertIssue: convertIssue
};
//# sourceMappingURL=issue.js.map
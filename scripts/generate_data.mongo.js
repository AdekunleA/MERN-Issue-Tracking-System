/* eslint-disable */

var db = new Mongo().getDB('issuetracker');

var owners = ['Goethe', 'Alexander', 'David', 'Liu', 'Cyrus', 'Oranyan'];

var statuses = ['New', 'Open', 'Assigned', 'Fixed', 'Verified', 'Closed'];

var i;

for (i=0; i < 1000; i++) {
    var randomCreatedDate = new Date(
     (new Date()) - Math.floor(Math.random() * 60) * 1000*60*60*24    
    );
    var randomCompletionDate = new Date(
        (new Date()) - Math.floor(Math.random() * 60) * 1000*60*60*24
    );
    var randomOwner = owners[Math.floor(Math.random() * 6 )];
    var randomStatus = statuses[Math.floor(Math.random() * 6 )];
    var randomEffort = Math.ceil(Math.random() * 20);
    var issue = {
        created: randomCreatedDate, completionDate: randomCompletionDate,
        owner: randomOwner, status: randomStatus, effort: randomEffort,
    };
    issue.title = 'Random, ' + i;
    db.issues.insert(issue);
}
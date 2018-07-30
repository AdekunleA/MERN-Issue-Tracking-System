import React from 'react';
import queryString from 'query-string';
import 'whatwg-fetch';
import PropTypes from 'prop-types';
import Pagination from "react-js-pagination";
import { Link } from 'react-router-dom';
import { Button, Glyphicon, Table, Panel } from 'react-bootstrap';


import IssueFilter from './IssueFilter.jsx';
import Toast from './Toast.jsx';

const IssueRow = (props) => {
  function onDeleteClick() {
    props.deleteIssue(props.issue._id);
  }

  return (
    <tr>
      <td><Link to={`/issues/${props.issue._id}`}>{props.issue._id.substr(-4)}</Link></td>
      <td>{props.issue.status}</td>
      <td>{props.issue.owner}</td>
      <td>{props.issue.created.toDateString()}</td>
      <td>{props.issue.effort}</td>
      <td>{props.issue.completionDate ? props.issue.completionDate.toDateString() : ''}</td>
      <td>{props.issue.title}</td>
      <td><Button bsSize="xsmall" onClick={onDeleteClick}><Glyphicon glyph="trash" /></Button></td>
    </tr>
  );
};


function IssueTable(props) {
  const issueRows = props.issues.map(issue => <IssueRow key={issue._id} issue={issue} deleteIssue={props.deleteIssue} />)
  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{issueRows}</tbody>
    </Table>
  );
}

export default class IssueList extends React.Component {
  constructor(props) {
    super(props);
    let superquery = queryString.parse(this.props.location.search);
    this.state = { issues: [], totalCount: null, toastVisible: false, toastMessage: '',
    toastType: 'success', activePage: parseInt(superquery._page || '1', 10) };

    this.selectPage = this.selectPage.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }
  
  componentDidUpdate(prevProps) {
    const oldQuery = queryString.parse(prevProps.location.search);
    const newQuery = queryString.parse(this.props.location.search);
    if (oldQuery.status === newQuery.status && oldQuery.effort_gte === newQuery.effort_gte &&
        oldQuery.effort_lte === newQuery.effort_lte && oldQuery._page === newQuery._page) {
      return;
    }
    this.loadData();
    
  }
  
  setFilter(query){
    this.props.history.push({ pathname: this.props.location.pathname, search: query});
  }
  
  deleteIssue(id) {
    fetch(`/api/issues/${id}`, { method: 'DELETE' }).then(response => {
      if (!response.ok) alert ('Failed to delete issue');
      else this.loadData();
    }); 
  }
  
  showError(message) {
    this.setState({ toastVisible: true, toastMessage: message, toastType: 'danger'});
  }
  
  dismissToast(message) {
    this.setState({ toastVisible: false });
  }
  
  
  componentDidMount() {
    this.loadData();
  }
  
  selectPage(pageNumber) {
    this.setState({ activePage: pageNumber });
    var queryInitial = queryString.parse(this.props.location.search);
    queryInitial._page = pageNumber
    const query = queryString.stringify(queryInitial);
    this.props.history.push({ pathname: this.props.location.pathname, search: query });
    
  }

  loadData() {
    fetch(`/api/issues${this.props.location.search}`).then(response => {
      if (response.ok) {
        response.json().then(data => {
          console.log("Total count of records:", data._metadata.totalCount);
          data.records.forEach(issue => {
            issue.created = new Date(issue.created);
            if (issue.completionDate)
              issue.completionDate = new Date(issue.completionDate);
          });
          this.setState({ issues: data.records, totalCount: data._metadata.totalCount });
        });
      } else {
        response.json().then(error => {
          this.showError("Failed to fetch issues:" + error.message)
        });
      }
    }).catch(err => {
      this.showError("Error in fetching data from server:", err);
    });
  }

  render() {
    return (
      <div>
       <Panel>
        <Panel.Heading>
          <Panel.Title id="panel-bold" toggle>Filter</Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          <IssueFilter setFilter={this.setFilter} initFilter={queryString.parse(this.props.location.search)}/>
        </Panel.Body>
       </Panel>
       <Pagination activePage={ this.state.activePage } totalItemsCount={ this.state.totalCount } itemsCountPerPage={20}
       pageRangeDisplayed={7} onChange={ this.selectPage } />
        <IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue} />
        <Toast showing={this.state.toastVisible} message={this.state.toastMessage} bsStyle={this.state.toastType}
          onDismiss={this.dismissToast} />
      </div>
    );
  }
}

IssueList.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object
  };
  
IssueRow.propTypes = {
  issue: PropTypes.object.isRequired,
  deleteIssue: PropTypes.func.isRequired,
};

IssueTable.propTypes = {
  issues: PropTypes.array.isRequired,
  deleteIssue: PropTypes.func.isRequired,
};


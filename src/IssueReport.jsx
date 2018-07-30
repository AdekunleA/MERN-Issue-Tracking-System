import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import IssueFilter from './IssueFilter.jsx';
import Toast from './Toast.jsx';

import { Panel, Table } from 'react-bootstrap';

const statuses = ['New', 'Open', 'Assigned', 'Fixed', 'Verified', 'Closed'];

const StatRow = (props) => (
    <tr>
      <th>{props.owner}</th>
      {statuses.map((status, index) => (<td key={index}>{props.counts[status]}</td>))}
    </tr>
);

StatRow.propTypes = {
    owner: PropTypes.string.isRequired,
    counts: PropTypes.object.isRequired,
};

export default class IssueReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: {}, toastVisible: false, toastMessage: '', toastType: 'success',
        };
        this.setFilter = this.setFilter.bind(this);
        this.showError = this.showError.bind(this);
        this.dismissToast = this.dismissToast.bind(this);
    }
    
    componentDidMount() {
        this.loadData();
    }
    
    componentDidUpdate(prevProps) {
        const oldQuery = queryString.parse(prevProps.location.search);
        const newQuery = queryString.parse(this.props.location.search);
        if (oldQuery.status === newQuery.status
            && oldQuery.effort_gte === newQuery.effort_gte
            && oldQuery.effort_lte === oldQuery.effort_lte) {
            return;
        }
        this.loadData();
    }
    
    setFilter(query) {
        this.props.history.push({ pathname: this.props.location.pathname, search: query});
    }
    
    showError(message) {
        this.setState({ toastVisible: true, toastMessage: message, toastType: 'danger' });
    }
    
    dismissToast() {
        this.setState({ toastVisible: false });
    }
    
    loadData() {
        fetch('/api/issues?_summary').then(response => {
            if (response.ok) {
                response.json().then(data => {
                console.log('Successful');
                this.setState({ stats: data });
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
    return(
        <div>
          <Panel>
            <Panel.Heading>
                <Panel.Title id="panel-bold" toggle>Filter</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
                <IssueFilter setFilter={this.setFilter} initFilter={queryString.parse(this.props.location.search)}/>
            </Panel.Body>
          </Panel>
          <Table bordered condensed hover responsive>
            <thead>
                <tr>
                    <th></th>
                    {statuses.map((status, index) => <th key={index}>{status}</th>)}
                </tr>
            </thead>
            <tbody>
                {Object.keys(this.state.stats).map((owner, index) =>
                  <StatRow key={index} owner={owner} counts={this.state.stats[owner]} />                                   
                )}
            </tbody>
          </Table>
          <Toast showing={this.state.toastVisible} message={this.state.toastMessage} onDismiss={this.dismissToast}
           bsStyle={this.state.toastType} />
        </div>
    );
  }
}

IssueReport.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object,
};
  
    
    

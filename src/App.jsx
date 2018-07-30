import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import IssueReport from './IssueReport.jsx';
import IssueList from './IssueList.jsx';
import IssueEdit from './IssueEdit.jsx';

const contentNode = document.getElementById('contents');
const NoMatch = () => <p>Page Not Found</p>;

export default class App extends React.Component {
  render(){
    return(
    <div>
     <Header />
     <div className="container-fluid">
      {this.props.children}
      <hr />
      <h5><small>
        Developed by <a href="http://github.com/AdekunleA">AdekunleA</a>
      </small></h5>
     </div>
    </div>
    );
  }
}
  

App.propTypes = {
  children: PropTypes.object.isRequired,
}


const RoutedApp = () => (
  <Router>
   <div>
    <Switch>
     <Redirect exact from="/" to="/issues" />
     <App>
      <Switch>
      <Route exact path="/issues" component={withRouter(IssueList)} />
      <Route path="/issues/:id" component={IssueEdit} />
      <Route path="/reports" component={withRouter(IssueReport)} />
      <Route component={NoMatch} />
      </Switch>
     </App>
    </Switch>
   </div>
  </Router>
);

const Header = () => (
  <Navbar fluid>
   <Navbar.Header>
    <Navbar.Brand>Issue Tracker</Navbar.Brand>
   </Navbar.Header>
   <Nav>
    <LinkContainer to="/issues">
      <NavItem>Issues</NavItem>
    </LinkContainer>
    <LinkContainer to="/reports">
      <NavItem>Reports</NavItem>
    </LinkContainer>
   </Nav>
   <Nav pullRight>
    <IssueAddNavItem />
    <NavDropdown id="user-dropdown" title={<Glyphicon glyph="option-horizontal" />} noCaret>
     <MenuItem>Logout</MenuItem>
    </NavDropdown>
   </Nav>
  </Navbar>
);

ReactDOM.render(<RoutedApp /> , contentNode);

if (module.hot) {
  module.hot.accept();
}
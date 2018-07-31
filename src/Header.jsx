import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router';
import Select from 'react-select';
import PropTypes from 'prop-types';

import IssueAddNavItem from './IssueAddNavItem.jsx';



const Header = (props) => {
    function searchIssues(input) {
      if (input.length < 2) return Promise.resolve({ options: [] });

    return fetch(`/api/issues?search=${input}`).then(response => {
      if (!response.ok) return response.json().then(error => Promise.reject(error));
      return response.json().then(data => {
        const options = data.records.map(issue => ({
          value: issue._id,
          label: `${issue._id.substr(-4)}: ${issue.title}`,
        }));
        return { options };
      }).catch(error => {
        alert(`Error fetching data from server: ${error}`);
      });
    });
  }
    
    function filterOptions(options) {
        return options;
    }
    
    function selectIssue(item) {
        if (item) props.history.push(`/issues/${item.value}`);
    }
    
    return (
    <Navbar fluid>
     <Col sm={5}>
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
     </Col>
     <Col sm={4}>
       <div style={{ paddingTop: 8 }}>
        <Select.Async instanceId="search" placeholder="Search..." autoload={false}
        cache={false} loadOptions={searchIssues} filterOptions={filterOptions} onChange={selectIssue} />
       </div>
     </Col>
     <Col sm={3}>
       <Nav pullRight>
        <IssueAddNavItem />
        <NavDropdown id="user-dropdown" title={<Glyphicon glyph="option-horizontal" />} noCaret>
         <MenuItem>Log out</MenuItem>
        </NavDropdown>
       </Nav>
     </Col>
    </Navbar>
 );
}

Header.propTypes = {
    history: PropTypes.object,
};

export default withRouter(Header);
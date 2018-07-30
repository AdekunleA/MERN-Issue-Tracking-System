import React from 'react';
import { Alert, Collapse } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class Toast extends React.Component {
    componentDidUpdate() {
        if (this.props.showing) {
            clearTimeout(this.dismissTimer);
            this.dismissTimer = setTimeout(this.props.onDismiss, 5000);
        }
    }
    
    componentWillUnmount() {
        clearTimeout(this.dismissTimer);
    }
    
    render() {
        return (
            <Collapse in={this.props.showing}>
              <div style={{ position: 'fixed', top: 30, left:0, right: 0, textAlign: 'center' }}>
                <Alert style={{ display: 'inline-block', width: 500 }} bsStyle={this.props.bsStyle} onDismiss={this.props.onDismiss}>
                    {this.props.message}
                </Alert>
              </div>
            </Collapse>
        );  
    }
}

Toast.propTypes = {
    showing: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    bsStyle: PropTypes.string,
    message: PropTypes.any.isRequired,
};

Toast.defaultProps = {
    bsStyle: 'success',
};
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { registeruser } from '../../actions/authActions';

import TextFieldGroupd from '../common/TextFieldGroup';

class Register extends Component {

  constructor(){
    super();
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      errors: {}
    }

  }

  componentDidMount = () => {
    if(this.props.auth.isAuthenticated){
      this.props.history.push('/dashboard');
    }
  }
  
  componentWillReceiveProps = (nextProps) => {
    if(nextProps.errors){
      this.setState({errors: nextProps.errors});
    }
  }

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  onSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    }

    this.props.registeruser(newUser, this.props.history);

    
  }

  render() {

    const { errors } = this.state;

    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">Create your DevConnector account</p>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroupd
                  value={this.state.name}
                  onChange={this.onChange}
                  placeholder="Name" 
                  name="name"
                  error={errors.name}
                />
                <TextFieldGroupd
                  type="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  placeholder="Email" 
                  name="email"
                  error={errors.email}
                />
                <TextFieldGroupd
                  type="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  placeholder="Password" 
                  name="password"
                  error={errors.password}
                />
                <TextFieldGroupd
                  type="password"
                  value={this.state.password2}
                  onChange={this.onChange}
                  placeholder="Password 2" 
                  name="password2"
                  error={errors.password2}
                />               
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Register.PropTypes = {
  registeruser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, { registeruser })(withRouter(Register)) ;

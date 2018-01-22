import React from 'react';
import axios from 'axios';
import braintree from 'braintree-web-drop-in';
import BraintreeDropin from 'braintree-dropin-react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { setFlash } from '../actions/flash';
import { setHeaders } from '../actions/headers';
import BraintreeDropSubmitButton from './BraintreeDropSubmitButton';
import {
  Dimmer,
  Loader,
  Segment,
} from 'semantic-ui-react';

class BraintreeDrop extends React.Component {
  state = {
    loaded: false,
    token: '',
    transactionId: '',
    redirect: false,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    axios.get('/api/braintree_token')
      .then( res => {
        const { data: token, headers } = res;
        dispatch(setHeaders(headers));
        this.setState({ token, loaded: true });
      })
      .catch( err => {
        dispatch(setHeaders(err.headers));
        dispatch(setFlash('Something Went Wrong', 'red'))
      });
  }

  handlePaymentMethod = (payload) => {
    const { dispatch, amount } = this.props;
    axios.post('/api/payment', { amount, ...payload })
      .then( res => {
        const { headers, data: transactionId } = res;
        dispatch(setHeaders(headers));
        this.setState({ redirect: true, transactionId });
      })
      .catch( res => {
        dispatch(setFlash('Error Posting Payment', 'red'));
        dispatch(setHeaders(res.headers));
        window.location.reload();
      });
  }

  render() {
    const { loaded, token , redirect, transactionId } = this.state;

    if (redirect) {
      return (
        <Redirect to={{
            pathname: '/paymount_success',
            state: { amount: this.props.amount, transactionId }
        }} />
      )
    }

    if (loaded) {
      return (
        <Segment basic textAlign='center'>
          <BraintreeDropin
            braintree={braintree}
            authorizationToken={token}
            handlePaymentMethod={this.handlePaymentMethod}
            renderSubmitButton={BraintreeDropSubmitButton}
            />
        </Segment>
      );
    } else {
      return (
        <Dimmer active>
          <Loader>Loading Payment Experience. Please wait...</Loader>
        </Dimmer>
      )
    }
  }

}

export default connect()(BraintreeDrop);

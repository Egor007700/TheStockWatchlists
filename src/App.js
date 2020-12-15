import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from '@material-ui/styles';
import validate from 'validate.js';

import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import validators from './common/validators';
import Routes from './Routes';
import { Provider } from "react-redux"
import store from "./redux/store/index";

import ReactNotifications from 'react-notifications-component';
import { now } from 'underscore';

const browserHistory = createBrowserHistory();

validate.validators = {
  ...validate.validators,
  ...validators
};

export const styles = (theme) => ({
  '@global': {
    webkit:{
      scrollbar:{
        width: '12px',
        track:{
          shadow: "0px 0px 6px transparent",
          borderRadius: '10px',
        },
        thumb:{
          borderRadius: '10px',
          shadow: "0px 0px 6px red"
        }
      },

    }
  },
});


class App extends Component {
  componentDidMount ()
  {
    console.log("storagedata", localStorage.key("storagedate"));
    if (localStorage.key("storagedate") != null){
      const nowtime = Date.now();
      const beforetime = localStorage.getItem("storagedate");
      const inteval = nowtime - beforetime;
      console.log("storagedatainterval", inteval);
      if (inteval > 72 * 60 * 60 * 1000){
        localStorage.clear();
      }
      else{
        // browserHistory.push('/dashboard')
      }
    }
  }
  render() {
    return (
      <div style={{height:'100%'}}>
      <ReactNotifications />
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router history={browserHistory}>
            <Routes />
          </Router>
        </ThemeProvider>
      </Provider>
      </div>
    );
  }
}
// export default (withStyles)(App);
export default App;

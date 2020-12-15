import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import {signin} from './../../services/api/httpclient';
import {connect} from 'react-redux';
import {setUserName} from './../../redux/actions'
import {setUserToken} from './../../redux/actions'
import { makeStyles,withStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  Typography,
  CardContent
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ReCAPTCHA from 'react-google-recaptcha'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { card } from 'assets/jss/material-kit-react';
import Avatar from '@material-ui/core/Avatar';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 128
    }
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#e4ebfe",
    backgroundSize:'cover',
    backgroundPosition:"top center",
    backgroundImage:'url(/images/background.jpg)',
  },
  grid: {
    height: '100%',
  },
  quoteContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  quote: {
    backgroundColor: theme.palette.neutral,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(/images/auth.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  quoteInner: {
    textAlign: 'center',
    flexBasis: '600px'
  },
  quoteText: {
    color: theme.palette.white,
    fontWeight: 300
  },
  name: {
    marginTop: theme.spacing(3),
    color: theme.palette.white
  },
  bio: {
    color: theme.palette.white
  },
  contentContainer: {},
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBototm: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  logoImage: {
    marginLeft: theme.spacing(4)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  form: {
    paddingLeft: 100,
    paddingRight: 100,
    paddingBottom: 125,
    flexBasis: 700,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  title: {
    marginTop: theme.spacing(3)
  },
  socialButtons: {
    marginTop: theme.spacing(3)
  },
  socialIcon: {
    marginRight: theme.spacing(1)
  },
  sugestion: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginTop: theme.spacing(2),
    color:"white",
  },
  signInButton: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(8),
    }
  },
  CardC : {
    marginTop:"15%",
    backgroundColor:"#ffffff",
    marginBottom:"300px"
  },
  CardH : {
    margin:"0",
    backgroundColor: "#e4ebfe",
  },
  avatar: {
    height:"50px",
    display:"block",
    marginLeft:'auto',
    marginRight:'auto',
    width:"150px"
  },
  multilineColor:{
    color:'#e3eaef'
  },
}));

const SignIn = props => {
  const { history, dispatch } = props;

  const classes = useStyles();
  const [isverified, setIsverified] = React.useState(false);
  // const [isverified, setIsverified] = React.useState(true);
  const recaptchaRef = React.createRef();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  useEffect(() => {
    const errors = validate(formState.values, schema);
    setFormState(formState => ({
      ...formState,
      isValid: (errors ? false : true) && isverified ,
      errors: errors || {}
    }));
  }, [formState.values, isverified]);

  const handleBack = () => {
    history.goBack();
  };

  useEffect(()=>{
    if (localStorage.key("useremail") != null) {
      history.push('/dashboard')
    }
  },[])

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };
  const onSubmit = () => {
    const recaptchaValue = recaptchaRef.current.getValue();
    this.props.onSubmit(recaptchaValue);
  }

  const handleSignIn = event => {
    var fs = require('browserify-fs');
    event.preventDefault();
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";

    if (isverified == true)
    {
      let payload = {
        "email": formState.values.email,
        "password": formState.values.password
      }
      let token = jwt.encode(payload, secret);
      payload = {"token": token};
      signin(payload).then( ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if (ret['data'].result === 'ok'){
          console.log("loginA")
          if (ret['data']['activeflag'] === true)
          {
            console.log(ret['data']);
            localStorage.setItem('access_token', ret['data']['access_token']);
            localStorage.setItem('username', ret['data']['name']);
            localStorage.setItem('useremail', ret['data']['email']);
            localStorage.setItem('userrole', "2");
            localStorage.setItem('storagedate', Date.now());
            dispatch(setUserName(ret['data']['name'], ret['data']['email'], ret['data']['image'],ret['data']['role']));
            dispatch(setUserToken(ret['data']['access_token']));
            history.push({
              pathname :'/dashboard',
              data : ret['data']
            });  
          }
        }
        else if(ret['data'].result === 'fail'){
          console.log("loginB")
          store.addNotification({
            title: 'Error',
            message: "wrong password",
            type: 'success',                         // 'default', 'success', 'info', 'warning'
            container: 'top-right',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
              duration: 3000
            }
          })
        }
        else {
          console.log("loginC")
          store.addNotification({
            title: 'Error',
            message: ret['data'].error,
            type: 'success',                         // 'default', 'success', 'info', 'warning'
            container: 'top-right',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
              duration: 3000
            }
          })
          history.push('/sign-up');
        }
      }).catch(err=>{
        console.log("loginD", err);
        // store.addNotification({
        //   title: 'Error',
        //   message: "server issue",
        //   type: 'error',                         // 'default', 'success', 'info', 'warning'
        //   container: 'top-right',                // where to position the notifications
        //   animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
        //   animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
        //   dismiss: {
        //     duration: 3000
        //   }
        // })
        history.push('/sign-up');

      }) 
    }
    else{

    }

  };

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

  const recaptchaverified = ()=>{
    setIsverified(true);
  }
  const recaptchatexpired = ()=>{
    setIsverified(false);
  }

  return (
    <div className={classes.root}>
      <Grid
        className={classes.grid}
        container
      >
        <Grid
          item
          lg={4}
          xs={1}
        >
          </Grid>
        <Grid
          className={classes.content}
          item
          lg={4}
          xs={10}
        >
          <div>
          <Card className={classes.CardC}>
          <CardHeader className={classes.CardH}
            avatar={
              // <a
              //   href="https://thestockwatchlist.com"
              // >
              //   <img aria-label="recipe" className={classes.avatar} src="/images/logos/logo.png" />
              // </a>
              <a
                href="https://dev.thestockwatchlist.com"
              >
                <img aria-label="recipe" className={classes.avatar} src="/images/logos/logo.png" />
              </a>
            }
         />
          <CardContent>
                <form
                  onSubmit={handleSignIn}
                >
                  <Typography
                    className={classes.title}
                    variant="h4"
                    style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                  >
                    Sign in
                  </Typography>
                  <Typography
                    className={classes.title}
                    variant="h3"
                    style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                  >
                    Welcome to Thestockwatchlist
                  </Typography>
                  <Typography
                    className={classes.title}
                    variant="h6"
                    style={{fontFamily:"Nunito,sans-serif", textAlign:"center"}}
                  >
                    Please log in to get access.
                  </Typography>
                  <TextField
                    className={classes.textField}
                    error={hasError('email')}
                    fullWidth
                    helperText={
                      hasError('email') ? formState.errors.email[0] : null
                    }
                    label="Email address"
                    name="email"
                    onChange={handleChange}
                    type="text"
                    value={formState.values.email || ''}
                    variant="outlined"
                  />
                  <TextField
                    className={classes.textField}
                    error={hasError('password')}
                    fullWidth
                    helperText={
                      hasError('password') ? formState.errors.password[0] : null
                    }
                    label="Password"
                    name="password"
                    onChange={handleChange}
                    type="password"
                    value={formState.values.password || ''}
                    variant="outlined"
                  />
                  <div style={{width:"100%"}}>
                  <Typography
                    color="textSecondary"
                    variant="body1"
                    style={{paddingBottom:"5px", paddingTop:"10px", float:"right"}}
                  >
                    Forget {' '}
                    <Link
                      component={RouterLink}
                      to="/forget-password"
                      variant="h6"
                    >
                      Password?
                    </Link>
                  </Typography>
                  </div>
                  <div>
                  <form onSubmit={onSubmit} style={{paddingTop:"10px"}}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LeLGb4ZAAAAAMdUIt6RvP1Zx0ubcWviNEivyOlV" //localhost
                      // sitekey="6Lfweb4ZAAAAALDSvvarbMFA-iSUbJKzKjOoiFM_" //prodserver
                      // sitekey="6LcjOMMZAAAAAGH8z14MefI5__CY8DHNz-ZZDuZd" //devserver
                      onChange={recaptchaverified}
                      onExpired={recaptchatexpired}
                      hl="en"
                    />
                  </form>
                  </div>
                  <Button
                    className={classes.signInButton}
                    color="primary"
                    disabled={!formState.isValid}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    style={{color:'white'}}
                  >
                    Sign in now
                  </Button>
                  <Typography
                    color="textSecondary"
                    variant="body1"
                  >
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/sign-up"
                      variant="h6"
                    >
                      Sign up
                    </Link>
                  </Typography>
                </form>
          </CardContent>
          </Card>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

SignIn.propTypes = {
  history: PropTypes.object
};

export default connect()(withRouter(SignIn));

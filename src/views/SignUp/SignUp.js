import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import { makeStyles } from '@material-ui/styles';
import {signup} from './../../services/api/httpclient';
import {setValidationToken, setUserName} from './../../redux/actions'
import {connect} from 'react-redux';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  FormHelperText,
  Checkbox,
  Typography
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ReCAPTCHA from 'react-google-recaptcha'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

const schema = {
  nickName: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 32
    }
  },
  firstName: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 32
    }
  },
  lastName: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 32
    }
  },
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
  },
  policy: {
    presence: { allowEmpty: false, message: 'is required' },
    checked: true
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
    height: '100%'
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
    flexDirection: 'column'
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 25,
    flexBasis: 700,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  title: {
    marginTop: theme.spacing(3)
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  policy: {
    marginTop: theme.spacing(1),
    display: 'flex',
    alignItems: 'center'
  },
  policyCheckbox: {
    marginLeft: '-14px'
  },
  signUpButton: {
    margin: theme.spacing(2, 0)
  },
  CardC : {
    marginTop:"15%",
    backgroundColor:"#ffffff",
    marginBottom:"30px"
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

}));

const SignUp = props => {
  const { history,dispatch } = props;

  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });
  const [isverified, setIsverified] = React.useState(false);
  const recaptchaRef = React.createRef();


  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: (errors ? false : true) && isverified ,
      errors: errors || {}
    }));
  }, [formState.values, isverified]);
  const onSubmit = () => {
    const recaptchaValue = recaptchaRef.current.getValue();
    this.props.onSubmit(recaptchaValue);
  }


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

  const handleBack = () => {
    history.goBack();
  };
  useEffect(()=>{
    if (localStorage.key("useremail") != null) {
      history.push('/dashboard')
    }
  },[])

  const handleSignUp = event => {
    event.preventDefault();
    if (isverified)
    {
      var jwt = require('jwt-simple');
      let secret = "Hero-Hazan-Trading-Watchlist";
      let payload = {
        "nickName" : formState.values.nickName,
        "firstName" : formState.values.firstName,
        "lastName" : formState.values.lastName,
        "email": formState.values.email,
        "password": formState.values.password,
        "role": "2",
      }
      let token = jwt.encode(payload, secret);
      console.log("token", token);
      payload = {"token": token};
      console.log("payload", payload);
      signup(payload).then( ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if (ret['data'].result === 'ok'){
          dispatch(setUserName(formState.values.nickName, formState.values.email, "",""));
//          dispatch(setValidationToken(ret['data']['token']));
          history.push('/validation');
        }
        else if (ret['data'].result === 'error')
        {
          if (ret['data'].message === 'nickName' )
          store.addNotification({
            title: 'Info',
            message: 'Invalid NickName, please input the nickname again!',
            type: 'success',                         // 'default', 'success', 'info', 'warning'
            container: 'top-right',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
              duration: 3000
            }
          })
          else{
            store.addNotification({
              title: 'Info',
              message: 'This Email is using in our site, please input other email again!',
              type: 'success',                         // 'default', 'success', 'info', 'warning'
              container: 'top-right',                // where to position the notifications
              animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
              animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
              dismiss: {
                duration: 3000
              }
            })  
          }
    // alert(ret['data'].message);
          // history.push('/sign-up');
        }
        else{
          store.addNotification({
            title: 'Info',
            message: 'Failed, please try again',
            type: 'success',                         // 'default', 'success', 'info', 'warning'
            container: 'top-right',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
              duration: 3000
            }
          })
    // alert(ret['data'].error);
          // history.push('/sign-up');
        }
      }, err => {
        store.addNotification({
          title: 'Info',
          message: 'Failed, please try again',
          type: 'success',                         // 'default', 'success', 'info', 'warning'
          container: 'top-right',                // where to position the notifications
          animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
          animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
          dismiss: {
            duration: 3000
          }
        })
// alert(err.error);
        // history.push('/sign-up');
      });
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
          <div >
          <Card className={classes.CardC}>
          <CardHeader className={classes.CardH}
            avatar={
              // <a
              //   href="https://thestockwatchlist.com"
              // >
              //   <img aria-label="recipe" className={classes.avatar} src="/images/logos/logo.png"/>
              // </a>
              <a
                href="https://dev.thestockwatchlist.com"
              >
                <img aria-label="recipe" className={classes.avatar} src="/images/logos/logo.png"/>
              </a>
            }
         />
          <CardContent>
              <form
                className={classes.form}
                onSubmit={handleSignUp}
              >
                <Typography
                  className={classes.title}
                  variant="h3"
                  style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                >
                  Get started with your account
                </Typography>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="h5"
                  style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                >
                  No credit card required.
                </Typography>
                <TextField
                  className={classes.textField}
                  error={hasError('nickName')}
                  fullWidth
                  helperText={
                    hasError('nickName') ? formState.errors.nickName[0] : null
                  }
                  label="Nick name"
                  name="nickName"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.nickName || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('firstName')}
                  fullWidth
                  helperText={
                    hasError('firstName') ? formState.errors.firstName[0] : null
                  }
                  label="First name"
                  name="firstName"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.firstName || ''}
                  variant="outlined"
                />
                <TextField
                  className={classes.textField}
                  error={hasError('lastName')}
                  fullWidth
                  helperText={
                    hasError('lastName') ? formState.errors.lastName[0] : null
                  }
                  label="Last name"
                  name="lastName"
                  onChange={handleChange}
                  type="text"
                  value={formState.values.lastName || ''}
                  variant="outlined"
                />
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
                <Typography
                  color="textSecondary"
                  style={{marginLeft:"5px"}}
                >
                  Your email is not visible to other users
                </Typography>                
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
                <form onSubmit={onSubmit} style={{paddingTop:"10px"}}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeLGb4ZAAAAAMdUIt6RvP1Zx0ubcWviNEivyOlV" //localhost
                    // sitekey="6Lfweb4ZAAAAALDSvvarbMFA-iSUbJKzKjOoiFM_" //prodserver
                    // sitekey="6LcjOMMZAAAAAGH8z14MefI5__CY8DHNz-ZZDuZd" // devserver
                    onChange={recaptchaverified}
                    onExpired={recaptchatexpired}
                    hl="en"
                  />
                </form>
                <div className={classes.policy}>
                  <Checkbox
                    checked={formState.values.policy || false}
                    className={classes.policyCheckbox}
                    color="primary"
                    name="policy"
                    onChange={handleChange}
                  />
                  <Typography
                    className={classes.policyText}
                    color="textSecondary"
                    variant="body1"
                  >
                    I have read the{' '}
                    <Link
                      color="primary"
                      component={RouterLink}
                      to="#"
                      underline="always"
                      variant="h6"
                    >
                      Terms and Conditions
                    </Link>
                  </Typography>
                </div>
                {hasError('policy') && (
                  <FormHelperText error>
                    {formState.errors.policy[0]}
                  </FormHelperText>
                )}
                <Button
                  className={classes.signUpButton}
                  color="primary"
                  disabled={!formState.isValid}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Sign up now
                </Button>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/sign-in"
                    variant="h6"
                  >
                    Sign in
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

SignUp.propTypes = {
  history: PropTypes.object
};

export default connect()(withRouter(SignUp));

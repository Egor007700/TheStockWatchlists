import React, { useState, useEffect } from 'react';
import { NavLink as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import validate from 'validate.js';
import {gettoken} from './../../services/api/httpclient';
import {connect} from 'react-redux';
import {setValidationTokenF, setValidationToken} from './../../redux/actions'
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Button,
  IconButton,
  TextField,
  Link,
  Typography
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ReCAPTCHA from 'react-google-recaptcha'
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';


const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#e4ebfe",
    backgroundSize:'cover',
    backgroundPosition:"top center",
    backgroundImage:'url(/images/background.jpg)',
    height:'100%'
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
    marginTop: theme.spacing(2)
  },
  signInButton: {
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

const ForgetPassword = props => {
  const { history, dispatch } = props;

  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });
  const [isverified, setIsverified] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const recaptchaRef = React.createRef();

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(formState => ({
      ...formState,
      isValid: (errors ? false : true) && isverified,
      errors: errors || {}
    }));
  }, [formState.values, isverified]);
  const onSubmit = () => {
    const recaptchaValue = recaptchaRef.current.getValue();
    this.props.onSubmit(recaptchaValue);
  }
  const handleBack = () => {
    history.goBack();
  };

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

  const handlebutton = ()=>{
    if (isverified)
    {
      let payload = {
        "useremail": formState.values.email
      }
      console.log("validationforget", formState.values.email);
      setUrl("/validation-forget?email=" + formState.values.email);

      gettoken(payload).then( ret=>{
        if (ret['data'].result === 'ok'){
            console.log("forgettoken", ret['data']['token']);
            dispatch(setValidationTokenF(ret['data']['token'], formState.values.email));
            history.push('/validation-forget');
        }
        else if(ret['data'].result === 'fail'){
          alert(ret['data'].message);
          history.push('/sign-up');
        }
        else {
          alert(ret['data'].error);
          history.push('/sign-up');
        }
      }, err => {
        alert(err.error);
        history.push('/sign-up');
      });
    }
    else{
      
    }
  } 
  const handleSignIn = event => {
    event.preventDefault();
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";
    if (isverified)
    {
      let payload = {
        "useremail": formState.values.email
      }
      console.log("validationforget", formState.values.email);
//      setUrl("/validation-forget?email=" + formState.values.email);
      let token = jwt.encode(payload, secret);
      payload = {"token": token};
      gettoken(payload).then( ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if (ret['data'].result === 'ok'){
          console.log("forgettoken", ret['data']['token']);
           dispatch(setValidationTokenF(ret['data']['token'], formState.values.email));
           history.push('/validation-forget');
        }
        else if(ret['data'].result === 'fail'){
          store.addNotification({
            title: 'Error',
            message: ret['data'].message,
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
        else {
          store.addNotification({
            title: 'Error',
            message: "",
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
      }, err => {
        store.addNotification({
          title: 'Error',
          message: err.error,
          type: 'success',                         // 'default', 'success', 'info', 'warning'
          container: 'top-right',                // where to position the notifications
          animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
          animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
          dismiss: {
            duration: 3000
          }
        })
        history.push('/sign-up');
      });
    }
    else{
      
    }
  };
  const recaptchaverified = ()=>{
    setIsverified(true);
  }
  const recaptchatexpired = ()=>{
    setIsverified(false);
  }

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

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
                className={classes.form}
                onSubmit={handleSignIn}
              >
                <Typography
                  className={classes.title}
                  variant="h3"
                  style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                >
                  Reset Password
                </Typography>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="h5"
                  style={{fontFamily:"Nunito,sans-serif", color:"#474d56", fontWeight:"bolder",textAlign:"center"}}
                >
                  You will receive the OTP code in your email.
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
                  <Button
                    className={classes.signInButton}
                    color="primary"
                    disabled={!formState.isValid}
                    fullWidth
                    size="large"
                    type='submit'
                    variant="contained"
                  >
                    Send Confirmation
                  </Button>
              </form>
              </CardContent>
              </Card>
            </div>
        </Grid>
      </Grid>
    </div>
  );
};

ForgetPassword.propTypes = {
  history: PropTypes.object
};

export default connect()(withRouter(ForgetPassword));

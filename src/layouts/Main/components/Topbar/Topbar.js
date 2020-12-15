import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar, Badge, Hidden, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { connect } from "react-redux";
import {getchatfornotification,readchat, savecontacts, logout} from '../../../../services/api/httpclient';
import { setNotificationR } from '../../../../redux/actions';


const mapStateToProps = state => {
  return { username:state.user.username, useremail:state.user.useremail, alertnotification:state.notification};
};
function mapDispatchToProps(dispatch) {
  return {
    setNotificationR:payload => dispatch(setNotificationR(payload))
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none',
    backgroundColor:"white"
  },
  flexGrow: {
    flexGrow: 1
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  },
  listroot: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  listitemroot:{
    cursor:'pointer'
  }
}));

const Topbar = props => {
  const { className, onSidebarOpen, username, useremail, setNotificationR, alertnotification, ...rest } = props;

  const classes = useStyles();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setEmail] = React.useState("");
  const history = useHistory();
  const [notifications, setNotification] = useState([]);

  React.useEffect(()=>{
    if (username === "")
    {
      setUserName(localStorage.getItem('username'));
    }
    else{
      setUserName(username);
    }  
    if (useremail === "")
    {
      setEmail(localStorage.getItem('useremail'));
    }
    else{
      setEmail(useremail);
    }  
  },[username, useremail]);

  React.useEffect(()=>{
    console.log('alertnotification', alertnotification);
    if (alertnotification.fromname == "") return;
    setNotification(()=>{
      const _notifications = [...notifications];
      console.log("notificationlog", notifications.length);
      if (notifications.length == 0){
        if (alertnotification.fromname !=""){
          console.log("notificationlog1", notifications);
          alertnotification.count = 1;
          _notifications.push(alertnotification);
          console.log("notificationlog1", _notifications);  
        }
      }
      else{
        console.log("notificationlog2", notifications);
        var insertNot;
        var notFlag = false;
        (notifications||[]).map(item=>{
          if (item.content == alertnotification.content){
            // if (item.count == undefined){
            //   item.count = 1
            // }
            // else{
            //   item.count = alertnotification.count + 1;
            // }
            notFlag = true;
          }
          else{
          }
        })
        if (notFlag == false)
        {
          _notifications.push(alertnotification);
        }        
      }
      return _notifications;
    });
  },[alertnotification])
  
  React.useEffect(()=>{
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";
    if ( userName === "" || userEmail === ""){return;}
    let payload= {
      'to' : userEmail
    }
    let token = jwt.encode(payload, secret);
    console.log("token", token);
    payload = {"token": token};
    getchatfornotification(payload).then(ret=>{
      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
      if(ret['data']['result'] === 'ok'){
        console.log('notification', ret['data']['data']);
        setNotification(ret['data']['data']);
      }
    })
  },[userName, userEmail])
  const onSignOut=(event)=>{
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    let payload = {
      'email' : userEmail
    }
    console.log("signoutpayload", payload);
    let token = jwt.encode(payload, secret);
    payload = {"token": token};      
    logout(payload).then(ret=>{
      if (ret['data']['result'] == 'ok'){

      }
    })
    localStorage.clear();
  }
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const readmessage = (param) =>{
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    if (param.content.includes("Alert") == true)
    {
      setOpen(false);
      setNotification(()=>{
        const _notifications = [];
        (notifications || []).map(item=>{
          if (item !== param){
            _notifications.push(item);
          }
        })
        return _notifications;
      })
      history.push("/dashboard");
    }
    else{
      setNotificationR(param);
      let payload = {
        'from' : param.fromperson,
        'to' : param.toperson
      }
      let token = jwt.encode(payload, secret);
      payload = {"token": token};      
      readchat(payload).then(ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        console.log("chatreadsuccessfullret", ret);
        if(ret['data']['result'] == 'ok'){
          console.log("chatreadsuccessfull");
          setNotification(()=>{
            const _notifications = [];
            (notifications || []).map(item=>{
              if (item !== param){
                _notifications.push(item);
              }
            })
            return _notifications;
          })
        }
      })
      let payload1 = {
        'from' : param.toperson,
        'to' : param.fromperson,
      }
      let token1 = jwt.encode(payload1, secret);
      payload1 = {"token": token1};      
      savecontacts(payload1).then(ret=>{
        console.log("savecontactsuccessfullret", ret);
       if (ret['data']['result'] == 'ok'){
        console.log("savecontactsuccessfull");
  
       } 
      })
      history.push("/chat");
    }
  }

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Toolbar>
        <RouterLink to="/dashboard" style={{color: 'inherit'}}>
          <img
            alt="Logo"
            src="/images/logos/logo.png"
            width="150"
            height="49"
          />
        </RouterLink>
        <div className={classes.flexGrow} />
          <IconButton color="inherit"
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            style={{color:"#00a64c"}}
          >
            <Badge
              badgeContent={notifications.length}
              color="error"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                <List className={classes.listroot}>
                  {
                    (notifications || []).map(notification=>(
                      <>
                        {/* <RouterLink to="/chat" style={{color: 'inherit'}}> */}
                          <ListItem alignItems="flex-start" onClick={()=>readmessage(notification)} className={classes.listitemroot}>
                          <ListItemAvatar>
                          <Badge badgeContent={notification.count} color="secondary">
                            <Avatar alt={notification.fromname} src={notification.fromimage} />
                          </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.fromname}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  className={classes.inline}
                                  color="textPrimary"
                                >
                                  {notification.lastchattime}
                                </Typography>
                                {" -" + notification.content}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      <Divider variant="inset" component="li" />
                      {/* </RouterLink> */}
                    </>
                    ))
                  }
                  {/* <ListItem alignItems="flex-start" onClick={handleClose} className={classes.listitemroot}>
                    <ListItemAvatar>
                      <Avatar alt="Remy Sharp" src="/images/avatars/avatar_1.png" />
                    </ListItemAvatar>
                    <ListItemText
                      primary="Brunch this weekend?"
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                          >
                            Ali Connors
                          </Typography>
                          {" — I'll be in your neighborhood doing errands this…"}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem alignItems="flex-start" onClick={handleClose} className={classes.listitemroot}>
                    <ListItemAvatar>
                      <Avatar alt="Travis Howard" src="/images/avatars/avatar_2.png" />
                    </ListItemAvatar>
                    <ListItemText
                      primary="Summer BBQ"
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                          >
                            to Scott, Alex, Jennifer
                          </Typography>
                          {" — Wish I could come, but I'm out of town this…"}
                        </React.Fragment>
                      }
                    />
                  </ListItem> */}
                  </List>
                  {/* <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={handleClose}>exclusive tips and updates about Material-UI and the React ecosystem.</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                  </MenuList> */}
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
          </Popper>
          <RouterLink to='/sign-in' style={{color: 'inherit'}} >
            <IconButton
              className={classes.signOutButton}
              onClick={onSignOut}
              style={{color:"#00a64c"}}
            >
              <InputIcon />
            </IconButton>
          </RouterLink>
        <Hidden lgUp>
          <IconButton
            style={{color:"#00a64c"}}
            onClick={onSidebarOpen}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
      <Divider />
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Topbar);

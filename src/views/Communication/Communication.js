import React , {useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/styles';
import { connect } from "react-redux";
import { CLeftSidebar, MiddleWidget } from './components';
import clsx from 'clsx';
import { useMediaQuery } from '@material-ui/core';
import {getuserdata} from '../../services/api/httpclient'
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import { useHistory } from 'react-router-dom';

const mapStateToProps = state => {
  return { notification : state.user.notification };
};
function mapDispatchToProps(dispatch) {
  return {
  };
}

const useStyles = makeStyles(theme => ({
  // root: {
  //   paddingLeft: 10,
  //   height: '100%',
  //   display: 'flex',
  //   flexDirection: 'row',
  //   position: 'relative'
  //   //backgroundColor: '#12213f',
  // }, 
  root: {
    paddingTop: 0,
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      paddingTop: 0
    }
  },
  shiftContent1: {
    paddingLeft: 240
  },
  content1: {
    height: '100%'
  }
}));

const Communication = (props) => {
  const {notification} = props;
  const classes = useStyles();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [sideemail, setSideemail] = React.useState("");
  const [sidename, setSidename] = React.useState("");
  const [sideavatar, setSideavatar] = React.useState("");
  const [messageflag, setMessageflag] = React.useState(false);
  const history = useHistory();
  useEffect(()=>{
    if (localStorage.key('username') == null){
      history.push('/sign-in');
    }
  },[])


  useEffect(() => {
    if (notification['fromperson'] === undefined) return;
    console.log('notificationalert', notification, notification['fromperson']);
      setSideemail(notification['fromperson']);
      setSidename(notification['fromname']);
      setSideavatar(notification['fromimage'])
  },[notification]);

  useEffect(()=>{
    if (sideemail == "") return;
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  

    let payload = {
      'useremail' : sideemail
    }
    let token = jwt.encode(payload, secret);
    payload = {"token": token};    
    getuserdata(payload).then(ret=>{
      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
      if(ret['data']['result'] === 'ok'){
        console.log("pmsetting",ret['data']['data']['privatemessageflag']);
        setMessageflag(ret['data']['data']['privatemessageflag']);
        if(ret['data']['data']['privatemessageflag'] === false){
          store.addNotification({
            title: 'Info',
            message: 'Cant accept the message',
            type: 'success',                         // 'default', 'success', 'info', 'warning'
            container: 'top-right',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
              duration: 3000
            }
          })    
          return;
        }
      }
    })

  },[sideemail])

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
    defaultMatches: true
  });


  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  const hadleChange = (email, name, avatar)=>{
    setOpenSidebar(false);
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    console.log("emailnameavatar", email, name, avatar);
    if (email == "")
    {
      console.log("emailnameavatar", email, name, avatar);
      setSideemail(email);
      setSidename(name);
      setSideavatar(avatar);
    }
    else{
      let payload = {
        'useremail' : email
      }
      let token = jwt.encode(payload, secret);
      payload = {"token": token};    
      getuserdata(payload).then(ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if(ret['data']['result'] === 'ok'){
          console.log("pmsetting",ret['data']['data']['privatemessageflag']);
          setMessageflag(ret['data']['data']['privatemessageflag']);
          if(ret['data']['data']['privatemessageflag'] === false){
            store.addNotification({
              title: 'Info',
              message: 'Cant accept the message',
              type: 'success',                         // 'default', 'success', 'info', 'warning'
              container: 'top-right',                // where to position the notifications
              animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
              animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
              dismiss: {
                duration: 3000
              }
            })    
            return;
          }
        }
      })
      console.log("side-email", email, name, avatar);
      setSideemail(email);
      setSidename(name);
      setSideavatar(avatar);
    }
  };
  const onSend = (text) =>{

  }
  const handleClose = (text) =>{
    console.log("setopensidebar", text);
    setOpenSidebar(text);
  }

  const shouldOpenSidebar = isDesktop ? true : openSidebar;

  return (
    // <div className={classes.root}>
    <div
    className={clsx({
      [classes.root]: true,
      [classes.shiftContent1]: isDesktop
    })}
  >
        <CLeftSidebar 
                onClose={handleSidebarClose}
                open={shouldOpenSidebar}
                variant={isDesktop ? 'persistent' : 'temporary'}
                onChange={hadleChange}
                notificationperson={sideemail}                
                closehandle={handleClose}
        />
        <main className={classes.content1}>
          <MiddleWidget onSend={onSend} sideEmail={sideemail} MessagFlag={messageflag} sideName = {sidename} sideAvatar={sideavatar} onSidebarOpen={handleSidebarOpen} messageflag={messageflag} />
        </main>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Communication);

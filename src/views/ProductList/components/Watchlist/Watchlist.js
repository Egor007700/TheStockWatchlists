import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Avatar, TableRow, TableCell, Table, TableHead, TableBody, CardHeader } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {getWatchlist, validgroupuser} from '../../../../services/api/httpclient';
import { NavLink as RouterLink, useHistory } from 'react-router-dom';
import { connect } from "react-redux";
import { setWatchuserInfo } from '../../../../redux/actions';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

const mapStateToProps = state => {
  return { username:state.user.username, useremail:state.user.useremail, userrole:state.user.userrole};
};
function mapDispatchToProps(dispatch) {
  return {
    setWatchuserInfo:(Wusername,Wuseremail,Wuserimage,Wuserrole) => dispatch(setWatchuserInfo(Wusername,Wuseremail,Wuserimage,Wuserrole))
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom:'10px',
    },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  header:{
    fontWeight:700
  },
  avatar: {
    backgroundColor: "#00a64c",
    height: 40,
    width: 40
  },
  icon: {
    height: 30,
    width: 30
  },
  difference: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    color: theme.palette.error.dark
  },
  differenceValue: {
    color: theme.palette.error.dark,
    marginRight: theme.spacing(1)
  }
}));

const Watchlist = props => {
  const { className, name, email, avatar,setWatchuserInfo,useremail,  ...rest } = props;

  const history = useHistory();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [datas, setDatas] = React.useState([]);
  const [url, setUrl] = React.useState("");
  const [userEmail, setEmail] = React.useState("");
  const [flag, setFlag] = React.useState(false);
  const [firstC, setFisrtC] = React.useState("");

  React.useEffect(()=>{
    if (useremail === "")
    {
        setEmail(localStorage.getItem('useremail'));
    }
    else{
        setEmail(useremail);
    }  
    },[ useremail]);

    React.useEffect(()=>{
      if (userEmail === "")
      {
        return;
      }
      else{
        var jwt = require('jwt-simple');
        let secret = "Hero-Hazan-Trading-Watchlist";  
        let payload = {
          'userEmail' : userEmail,
          'sideEmail' : email
        }
        let token = jwt.encode(payload, secret);
        payload = {"token": token};      
        console.log('validgroupuser', payload);
        validgroupuser(payload).then(ret=>{
          ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
          console.log('validgroupuserresult', ret);
          if(ret['data']['result'] == 'ok'){
            setFlag(ret['data']['data']);
          }
        })
      }  
      },[ userEmail]);


  const handleClick = (event) => {
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    setAnchorEl(event.currentTarget);
    let payload = {
      'userEmail' : userEmail,
      'sideEmail' : email
    }
    let token = jwt.encode(payload, secret);
    payload = {"token": token};      
    console.log('validgroupuser', payload);
    validgroupuser(payload).then(ret=>{
      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
      console.log('validgroupuserresult', ret);
      if(ret['data']['result'] == 'ok'){
        setFlag(ret['data']['data']);
      }
    })
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDetail = () => {
    if (flag == false){
      if (email == userEmail){
        history.push('/dashboard')
      }
      else{
        store.addNotification({
          title: 'Info',
          message: 'You cant see his watchlist',
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
    else{
      if (email == userEmail){
        history.push('/dashboard')
      }
      else{
        history.push('/newwatchlist');
        setWatchuserInfo(name, email, avatar, userEmail);
        //    setUrl("/newwatchlist?name=" + name + "&email=" + email + "&avatar=" + avatar + "&myemail=" + myemail);
            setAnchorEl(null);        
      }
    }
  }
  
  React.useEffect(()=>{
    if (name == "" || email == "") return;
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    let payload = {
      "username" : name,
      "useremail" : email
    }
    let token = jwt.encode(payload, secret);
    payload = {"token": token};      
    getWatchlist(payload).then(ret=>{
      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
      console.log("watchlistdata", ret['data']['data']);
      setDatas(()=>{
        const _datas = [];
        (ret['data']['data']||[]).map(item=>{
          _datas.push(item);
        })
        return _datas;
      })
      // setDatas(ret['data']['data']);
    })
    setFisrtC(name.substring(0,1).toUpperCase());
  },[name, email]);

  const converDate = (date)=>{
    return date.split('T')[0];
  };

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader className={classes.header}
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar} src={avatar}>
            {firstC}
          </Avatar>
        }
        action={
          <>
          <IconButton aria-label="settings" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
          style={{marginTop:'40px', marginLeft:'-30px'}}
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          >
          {/* <RouterLink to={url} target="_top"> */}
            <MenuItem onClick={handleDetail}>Detail</MenuItem>
          {/* </RouterLink>           */}
          {/* <MenuItem onClick={handleClose}>Follow</MenuItem> */}
        </Menu>
        </>
        }
        title={<h2 style={{color:"black"}}>{name}</h2>}
        subheader="Top Followed-User's Watchlist"
      />
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
          {/* <Grid item>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              Top Followed-User's Watchlist
            </Typography>
            <Typography variant="h3">{name}</Typography>
          </Grid>
          <Grid item>
            <Avatar className={classes.avatar} src={avatar} />
          </Grid> */}
          <div style={{height:"230px", display:'flex', flexDirection:'row', position:'relative', overflowY:'scroll', width:'100%'}}>
          <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>CurrentPrice</TableCell>
                  <TableCell>Change(%)</TableCell>
                  <TableCell>52WeeksHigh</TableCell>
                  <TableCell>TradeTiming</TableCell>
                  <TableCell>Short/Long</TableCell>
                  <TableCell>EarningReport</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(datas||[]).map(data => (
                  <TableRow
                    key={data.symbolname}
                    hover
                  >
                    <TableCell>{data.symbol}</TableCell>
                    <TableCell>{data.currentstockprice}</TableCell>
                    <TableCell>{data.currentchange}</TableCell>
                    <TableCell>{data.yearhigh}</TableCell>
                    <TableCell>{data.tradetimingstring}</TableCell>
                    <TableCell>{data.shortorlongstring}</TableCell>
                    <TableCell>{converDate(data.earningdate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Grid>
      </CardContent>
    </Card>
  );
};

Watchlist.propTypes = {
  className: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Watchlist);

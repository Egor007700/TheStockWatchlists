import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {savewatchlisttemplate, getwatchlisttemplate, updatewatchlisttemplate} from '../../../../services/api/httpclient';
import {changeDashboardType } from '../../../../redux/actions';
import { connect } from "react-redux";
import { NavLink as RouterLink, withRouter } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Typography,
  Button
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import HelpIcon from '@material-ui/icons/Help';

const mapStateToProps = state => {
  return { username:state.user.username, useremail:state.user.useremail, dashboard_type:state.common.dashboard_type};
};
function mapDispatchToProps(dispatch) {
    return {
      changeDashboardType:payload => dispatch(changeDashboardType(payload))
    };
}

const useStyles = makeStyles(() => ({
  root: {},
  item: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight:'5px',
  },
  tooltipa:{
    marginTop:'auto',
    marginBottom:'auto',
    marginLeft:'auto',
    marginRight:'0px'
  },
  tooltip:{
    textColor:'black',
    color:'black',
  }
}));

const Notifications = props => {
   const history = useHistory();
  const { className,username, useremail,dispatch,changeDashboardType, ...rest } = props;

  const [userName, setUserName] = React.useState("");
  const [userEmail, setEmail] = React.useState("");
  const [initialflag, setInitialFlag] = React.useState(false);
  const [active, setActive] = React.useState(false);

  React.useEffect(()=>{
    if (username == "")
    {
        setUserName(localStorage.getItem('username'));
    }
    else{
        setUserName(username);
    }  
    if (useremail == "")
    {
        setEmail(localStorage.getItem('useremail'));
    }
    else{
        setEmail(useremail);
    }  
    },[username, useremail]);

  const classes = useStyles();

  const [data, setData] = React.useState([
    {id : 1, name:"symbol", label:"Symbol", flag:true, checked:true, tooltip:'this is ticker'},
    {id : 2, name:"sector", label:"Sector", flag:true, checked:true, tooltip:'this is ticker'},
    {id : 3, name:"tradetiming", label:"Trade Timing", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 4, name:"shortorlong", label:"Short/Long", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 5, name:"tradetimeframe", label:"Trade Timeframe", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 6, name:"yearhigh", label:"52Weeks High", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 7, name:"currentprice", label:"Current StockPrice", flag:false, checked:true, tooltip:'this is ticker'},
    {id : 8, name:"currentchange", label:"Change(%)", flag:false, checked:true, tooltip:'this is ticker'},
    {id : 9, name:"entryprice", label:"Entry Price", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 10, name:"entrychange", label:"Change", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 11, name:"stoploss", label:"StopLoss", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 12, name:"tradescore", label:"TradeScore", flag:false, checked:false, tooltip:''},
    {id : 13, name:"exitprice", label:"Exit Price", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 14, name:"earningdate", label:"Earning ReportDate", flag:false, checked:true, tooltip:'this is ticker'},
    {id : 15, name:"alertprice", label:"Alert Price", flag:false, checked:true, tooltip:''},
    {id : 16, name:"rewardinR", label:"Reward InR", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 17, name:"addedprice", label:"Initial Price", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 18, name:"addedpricechange", label:"Change(%)", flag:false, checked:false, tooltip:'this is ticker'},
    {id : 19, name:"dateadded", label:"Date Added", flag:false, checked:true, tooltip:'this is ticker'},
    {id : 20, name:"comment", label:"Comment", flag:false, checked:false, tooltip:'this is ticker'}
  ]);

  React.useEffect(()=>{
    if (userName=="" || userEmail=="") 
    {
        return;
    }
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    let payloadforget={
        "username" : userName,
        "useremail" : userEmail,
    }
    let token = jwt.encode(payloadforget, secret);
    payloadforget = {"token": token};      
    getwatchlisttemplate(payloadforget).then(ret=>{
      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if(ret.data.result == 'ok')
        {
            setInitialFlag(false);
            setData(()=>{
                var datas = [...data];
                datas.map(item=>{
                    if (item.name == "symbol"){
                        item.checked = ret.data.data.symbol;
                    }
                    else if(item.name == "sector"){
                        item.checked = ret.data.data.sector;
                    }
                    else if(item.name == "tradetiming"){
                        item.checked = ret.data.data.tradetiming;
                    }
                    else if(item.name == "shortorlong"){
                        item.checked = ret.data.data.shortorlong;
                    }
                    else if(item.name == "tradetimeframe"){
                        item.checked = ret.data.data.tradetimeframe;
                    }
                    else if(item.name == "yearhigh"){
                        item.checked = ret.data.data.yearhigh;
                    }
                    else if(item.name == "currentprice"){
                        item.checked = ret.data.data.currentprice;
                    }
                    else if(item.name == "currentchange"){
                        item.checked = ret.data.data.currentchange;
                    }
                    else if(item.name == "entryprice"){
                        item.checked = ret.data.data.entryprice;
                    }
                    else if(item.name == "entrychange"){
                        item.checked = ret.data.data.entrychange;
                    }
                    else if(item.name == "stoploss"){
                        item.checked = ret.data.data.stoploss;
                    }
                    else if(item.name == "exitprice"){
                        item.checked = ret.data.data.exitprice;
                    }
                    else if(item.name == "earningdate"){
                        item.checked = ret.data.data.earningdate;
                    }
                    else if(item.name == "alertprice"){
                        item.checked = ret.data.data.alertprice;
                    }
                    else if(item.name == "rewardinR"){
                        item.checked = ret.data.data.rewardinR;
                    }
                    else if(item.name == "addedprice"){
                        item.checked = ret.data.data.addedprice;
                    }
                    else if(item.name == "addedpricechange"){
                        item.checked = ret.data.data.addedpricechange;
                    }
                    else if(item.name == "dateadded"){
                        item.checked = ret.data.data.dateadded;
                    }
                    else if(item.name == "comment"){
                        item.checked = ret.data.data.comment;
                    }
                    else if(item.name == "tradescore"){
                      item.checked = ret.data.data.tradescore;
                  }
                  
                    return [item];    
                });
                return datas;
            });
        }
        else{
            setInitialFlag(true);
        }
    });
  },[userName, userEmail]);

  const onOK=() => {
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    let payloadforget={
        "username" : userName,
        "useremail" : userEmail,
    }
    if(initialflag == true)
    {
        let payload ={
            "username" : userName,
            "useremail" : userEmail,
            "data":[]
        } ;
        data.map(item=>{
            let bufdata={
                "name" : "",
                "checked" : false,
            };
            bufdata.name = item.name;
            bufdata.checked = item.checked;
            payload.data.push(bufdata);
        })
        console.log("savewatchlisttemplatepayload",payload)
        let token = jwt.encode(payload, secret);
        payload = {"token": token};    
        savewatchlisttemplate(payload).then( ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        console.log("savewatchlisttemplateresult",ret['data'].result);
          if (ret['data'].result === 'ok'){
            console.log("savewatchlisttemp");
            setActive(true);
            history.push('/dashboard');
              changeDashboardType({dashboard_type:0});
          }
          else if(ret['data'].result == 'fail'){
          }
          else {
          }
          }, err => {
          });                          
    }
    else
    {
        let payload ={
            "username" : userName,
            "useremail" : userEmail,
            "data":[]
        } ;
        data.map(item=>{
            let bufdata={
                "name" : "",
                "checked" : false,
            };
            bufdata.name = item.name;
            bufdata.checked = item.checked;
            payload.data.push(bufdata);
        })
        console.log("updatewatchlisttemplatepayload",payload)
        let token = jwt.encode(payload, secret);
        payload = {"token": token};      
        updatewatchlisttemplate(payload).then( ret=>{
          ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
          console.log("savewatchlisttempresult", ret['data'].result);
          if (ret['data'].result === 'ok'){
              console.log("savewatchlisttemp");
              setActive(true);
              history.push('/dashboard');
            }
            else if(ret['data'].result == 'fail'){
            }
            else {
            }
            }, err => {
            });                                         
    }
  }

  const handleChange = (event) => {
    setData(()=>{
        var datas = [...data];
        datas.map(item=>{
            if (event.target == null)
            {
                return [item];
            }
            else{
                if (event.target.name == item.name)
                {
                    item.checked = event.target.checked;
                    return [item];
                }                
            }
        })
        return datas;
    });
  };


  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <form>
        <CardHeader
          subheader="Manage the watchlist view"
          title="Import Watchlist Template"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={3}
            wrap="wrap"
          >
            <Grid
              className={classes.item}
              item
              md={4}
              sm={6}
              xs={12}
            >
              {
                  data.map(item=>{                        
                      let bufclassname;
                      if (item.id % 2 == 1)
                      {
                        if (item.tooltip == '')
                        {
                          return <FormControlLabel
                          disabled={item.flag}
                          control={
                          <Checkbox
                              checked={item.checked}
                              onChange={handleChange}
                              name={item.name}
                              style={{color:"#00a64c"}}
                          />
                          }
                          label={item.label}
                          />                          
                        }
                        else {
                          return <div style={{display:'flex'}}><FormControlLabel
                          disabled={item.flag}
                          control={
                          <Checkbox
                              checked={item.checked}
                              onChange={handleChange}
                              name={item.name}
                              style={{color:"#00a64c"}}
                          />
                          }
                          label={item.label}
                        /><a data-tip data-for={item.name} className={classes.tooltipa}><HelpIcon fontSize='small' color='primary'></HelpIcon></a>
                        <ReactTooltip id={item.name} type='success' effect='solid' className={classes.tooltip}><span>{item.tooltip}</span></ReactTooltip></div>
                        }

                      }
                  })
              }
            </Grid>
            <Grid
              className={classes.item}
              item
              md={4}
              sm={6}
              xs={12}
            >
                {
                    data.map(item=>{                        
                        let bufclassname;
                        if (item.id % 2 == 0)
                        {
                          if (item.tooltip == '')
                          {
                            return <FormControlLabel
                            disabled={item.flag}
                            className={bufclassname}
                            control={
                            <Checkbox
                                checked={item.checked}
                                onChange={handleChange}
                                name={item.name}
                                style={{color:"#00a64c"}}
                            />
                            }
                            label={item.label}
                            />                            
                          }
                          else{
                            return <div style={{display:'flex'}}><FormControlLabel
                            disabled={item.flag}
                            className={bufclassname}
                            control={
                            <Checkbox
                                checked={item.checked}
                                onChange={handleChange}
                                name={item.name}
                                style={{color:"#00a64c"}}
                            />
                            }
                            label={item.label}
                            /><a data-tip data-for={item.name} className={classes.tooltipa}><HelpIcon fontSize='small' color='primary'></HelpIcon></a>
                            <ReactTooltip id={item.name} type='success' effect='solid' className={classes.tooltip}><span>{item.tooltip}</span></ReactTooltip></div>
                          }
                        }
                    })
                }

            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
        <Button
          style={{color:"#00a64c"}}
          variant="outlined"
          onClick={()=>onOK()}
        >
          Save
        </Button>
        </CardActions>
      </form>
    </Card>
  );
};

Notifications.propTypes = {
  history: PropTypes.object,
  className: PropTypes.string
};

export default connect(mapStateToProps,mapDispatchToProps)(Notifications);

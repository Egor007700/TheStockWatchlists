import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import {searchglobalfollowers, getearningstocks, gettopstocks, getshortlong, gettopstocksforshortlong, getglobalfollowerslist, getstockpriceintervaltime} from '../../services/api/httpclient';
import {
  EarningReportStocks,
  MostFollowedUsers,
  DirectionofTraders,
  TopStocks,
  TopStocksforShort,
  TopStocksforLong,
  UsersToolbar,
  Watchlist
} from './components';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from "react-redux";
import {useHistory} from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';

const mapStateToProps = state => {
  return { useremail:state.user.useremail};
};
function mapDispatchToProps(dispatch) {
    return {
    };
}


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const ProductList = props => {
  const classes = useStyles();
  const {  useremail } = props;
  const history = useHistory();
  var count = 0;
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [weekstocks, setWeekStocks] = useState([]);
  const [shortorlong, setShortorlong] = useState('');
  const [weekshortorlong, setWeekShortorlong] = useState('');
  const [shortdata, setShortdata] = useState([]);
  const [weekshortdata, setWeekShortdata] = useState([]);
  const [longdata, setLongdata] = useState([])
  const [weeklongdata, setWeekLongdata] = useState([])
  const [followerslist, setFollowerslist] = useState([])
  const [openText, setOpenText] = React.useState("block");
  const [searchText, setSearchText] = React.useState("-1");
  const [progress, setProgress] = React.useState(0);
  const [userEmail, setEmail] = React.useState("");
  const [open, setOpen] = React.useState(true);
  const [intervaltime, setIntervaltime] = React.useState(0);
  useEffect(()=>{
    if (localStorage.key('username') == null){
      history.push('/sign-in');
    }
  },[])
  React.useEffect(()=>{
    getstockpriceintervaltime().then(ret=>{
      if (ret['data']['result'] == 'ok'){
        setIntervaltime(parseInt(ret['data']['data']) * 1000 * 60);
        // setIntervaltime(1000 * 60 * 0.5);
      }
    })
  },[])
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
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    if (intervaltime != 0)
    {
      getglobalfollowerslist().then(ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);        
        if (ret['data']['result'] === 'ok'){
          setFollowerslist(ret['data']['data']);
          setTimeout(()=>{
            setOpen(false);
          }, 1000)
          setProgress(20);
          getearningstocks().then(ret=>{
            if (ret['data']['result'] === 'ok'){
              console.log("products", ret['data']['data']);
              setProducts(ret['data']['data']);
              setProgress(40);
              gettopstocks().then(ret=>{
                if (ret['data']['result'] === 'ok'){
                  console.log("topproducts", ret['data']['data']);
                  setStocks(ret['data']['data']);
                  setWeekStocks(ret['data']['weekdata']);
                  setProgress(60);
                  getshortlong().then(ret=>{
                    if (ret['data']['result'] === 'ok'){
                      console.log("shortorlong", ret['data']['data']);
                      setShortorlong(ret['data']['data']);
                      setWeekShortorlong(ret['data']['weekdata']);
                      setProgress(80);
                      gettopstocksforshortlong().then(ret=>{
                        if (ret['data']['result'] === 'ok'){
                          setProgress(100);
                          console.log("shortorlong", ret['data']['data']);
                          setShortdata(ret['data']['shortdata']);
                          setWeekShortdata(ret['data']['weekshortdata']);
                          setLongdata(ret['data']['longdata']);
                          setWeekLongdata(ret['data']['weeklongdata']);
                          setOpenText("none");
                        }
                      });
                                }
                  });
                        }
              });
                }
          });
        }
      });
    }
    if (intervaltime != 0)
    {
      setInterval(()=>{
        console.log("setintervaltime");
        getglobalfollowerslist().then(ret=>{
          ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);        
          if (ret['data']['result'] === 'ok'){
            setFollowerslist(ret['data']['data']);
            setTimeout(()=>{
              setOpen(false);
            }, 1000)
            setProgress(20);
            getearningstocks().then(ret=>{
              if (ret['data']['result'] === 'ok'){
                console.log("products", ret['data']['data']);
                setProducts(ret['data']['data']);
                setProgress(40);
                gettopstocks().then(ret=>{
                  if (ret['data']['result'] === 'ok'){
                    console.log("topproducts", ret['data']['data']);
                    setStocks(ret['data']['data']);
                    setWeekStocks(ret['data']['weekdata']);
                    setProgress(60);
                    getshortlong().then(ret=>{
                      if (ret['data']['result'] === 'ok'){
                        console.log("shortorlong", ret['data']['data']);
                        setShortorlong(ret['data']['data']);
                        setWeekShortorlong(ret['data']['weekdata']);
                        setProgress(80);
                        gettopstocksforshortlong().then(ret=>{
                          if (ret['data']['result'] === 'ok'){
                            setProgress(100);
                            console.log("shortorlong", ret['data']['data']);
                            setShortdata(ret['data']['shortdata']);
                            setWeekShortdata(ret['data']['weekshortdata']);
                            setLongdata(ret['data']['longdata']);
                            setWeekLongdata(ret['data']['weeklongdata']);
                            setOpenText("none");
                          }
                        });
                                  }
                    });
                          }
                });
                  }
            });
          }
        });
      }, intervaltime)
    }
  },[intervaltime]);

  React.useEffect(()=>{
    var jwt = require('jwt-simple');
    let secret = "Hero-Hazan-Trading-Watchlist";  
    if (searchText === "-1") return;
    console.log("searchtextformostfollowerdusers", searchText);
    if (searchText === ""){
      setOpen(true);
      getglobalfollowerslist().then(ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if (ret['data']['result'] === 'ok'){
          setFollowerslist(ret['data']['data']);
          setTimeout(()=>{
            setOpen(false);
          }, 1000)
        }  
      })
    }
    else{
      let payload = {
        'searchText' : searchText,
      }
      searchglobalfollowers(payload).then(ret=>{
        ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
        if (ret['data']['result'] === 'ok'){
          setFollowerslist(ret['data']['data']);
        }          
      })
    }
  },[searchText])

  const handlechange = (text) =>{
    console.log("searchTextforpropscheck", text);
    setSearchText(text);
  }

  console.log('followerslist', followerslist);

  return (
    <div className={classes.root}>
    <Backdrop className={classes.backdrop} open={open}>
    <LinearProgress style={{display:openText}} color="primary" variant="determinate" value={progress}/>
    </Backdrop>
      <UsersToolbar onChange={handlechange} />
      <div className={classes.content}>
        <Grid
          container
          spacing={4}
        >
          <Grid
            item
            lg={6}
            md={12}
            xl={6}
            xs={12}
          >
            <MostFollowedUsers followerslist={followerslist}/>
          </Grid>
          <Grid
            item
            lg={2}
            md={4}
            xl={2}
            xs={12}
          >
            <EarningReportStocks products={products}/>
          </Grid>
          <Grid
            item
            lg={2}
            md={4}
            xl={2}
            xs={6}
            style={{paddingRight:"0px"}}
          >
            <TopStocks stocks={stocks} titleU={"Today Top Stocks"} />
          </Grid>
          <Grid
            item
            lg={2}
            md={4}
            xl={2}
            xs={6}
            style={{paddingLeft:"0px"}}
          >
            <TopStocks stocks={weekstocks} titleU={"This Week Top Stocks"} />
          </Grid>
          <Grid
            item
            lg={8}
            md={12}
            xl={8}
            xs={12}
          >{
            followerslist.map(users=>{
              if (followerslist.length  <=5 || open == false )
              {
                count = count + 1;
                return (
                  <Watchlist key={count} name={users.username} email={users.email} avatar={users.avatar} timeU={Date.now()} />
                )  
              }
              else{
                if (count < 5 || open == false){
                  count = count + 1;
                  return (
                    <Watchlist key={count} name={users.username} email={users.email} avatar={users.avatar} myemail={userEmail} timeU={Date.now()} />
                  )    
                }
              }
              })
          }
          </Grid>
          <Grid
            item={true}
            lg={2}
            md={6}
            xl={2}
            xs={6}
            style={{paddingRight:"0px"}}
          >
            <Grid
              item
              lg={12}
              md={12}
              xl={12}
              xs={12}
              container
              direction="column"
              justify="space-between"
              alignItems="flex-end"
            >
              <DirectionofTraders shortorlong={shortorlong} titleU={"Today Direction Of Traders"}/>
              <TopStocksforShort shortdata={shortdata} titleU={"Today Top Stocks For Short"}/>
              <TopStocksforLong longdata={longdata} titleU={"Today Top Stocks For Long"}/>
            </Grid>
          </Grid>
          <Grid
            item
            lg={2}
            md={6}
            xl={2}
            xs={6}
            style={{paddingLeft:"0px"}}
          >
            <Grid
              item
              lg={12}
              md={12}
              xl={12}
              xs={12}
              container
              direction="column"
              justify="space-between"
              alignItems="flex-end"
            >
              <DirectionofTraders shortorlong={weekshortorlong} titleU={"Week Direction Of Traders"}/>
              <TopStocksforShort shortdata={weekshortdata} titleU={"Week Top Stocks For Short"}/>
              <TopStocksforLong longdata={weeklongdata} titleU={"Week Top Stocks For Long"}/>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default connect(mapStateToProps,mapDispatchToProps)(ProductList);

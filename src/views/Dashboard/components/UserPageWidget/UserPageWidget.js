import React, {useCallback} from 'react';
import MaterialTable from 'material-table';
import {MTableBodyRow} from 'material-table';
import { TradingViewWidget } from '../../components'
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import sector from './sector'
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { VariableSizeList } from 'react-window';
import { Typography } from '@material-ui/core';
import {getstockpriceintervaltime, saveWatchlist, deleteWatchlist,getWatchlist,getsector, updateWatchlist, getcurrentstockprice, getwatchlisttemplate, validwatchlist, getsymbollists, saveroworder} from '../../../../services/api/httpclient';
import { connect } from "react-redux";
import { setSymbolName } from '../../../../redux/actions';
import { changeDashboardType } from '../../../../redux/actions';
import { setAlert, setNotification, setTableSize } from '../../../../redux/actions';
import { Link as RouterLink } from 'react-router-dom';


const mapStateToProps = state => {
  return { username:state.user.username, useremail:state.user.useremail, userrole:state.user.userrole, dashboard_type:state.common.dashboard_type, tablesize : state.user.tablesize};
};
function mapDispatchToProps(dispatch) {
  return {
    changeDashboardType:payload => dispatch(changeDashboardType(payload)),
    setSymbolName:payload => dispatch(setSymbolName(payload)),
    setTableSize:payload => dispatch(setTableSize(payload)),
    setAlert:(alertflag,alertsymbol) => dispatch(setAlert(alertflag, alertsymbol)),
    setNotification:(fromname, fromimage,lastchattime,content) => dispatch(setNotification(fromname, fromimage,lastchattime,content))
  };
}

// function refreshPage() {
//   window.location.reload(false);
// }

var options;
const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;


  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

const useStyles1 = makeStyles({
    listbox: {
      boxSizing: 'border-box',
      '& ul': {
        padding: 0,
        margin: 0,
      },
    },
    tr: {
      cursor:"-webkit-grab",
      cursor: 'grab',
      "&:hover" : {
        cursor:"-webkit-grab",
        cursor: 'grab',
      },
      "&:active" : {
        cursor:"-webkit-grabbing",
        cursor: 'grabbing',
      }
    },
  });

const sectorOptions=[];

const UserPageWidget = (props) => {
    const { className,username, useremail,userrole, dispatch, changeDashboardType, setSymbolName, setAlert, dense, pagination, watchid, setNotification, width, tablesize, ...rest } = props;
    const classes = useStyles1();
    const [userName, setUserName] = React.useState("");
    const [userEmail, setEmail] = React.useState("");
    const [userRole, setRole] = React.useState("");
    const [densestring, setDensestring] = React.useState("default");

    React.useEffect(()=>{
      if (dense == true){
        setDensestring("dense");
      }
      else{
        setDensestring("default");
      }
    },[dense])

    React.useEffect(()=>{
      getsymbollists().then(ret=>{
        if (ret['data']['result'] == 'ok') {
          console.log("symbolList", ret['data']['data']);
          options = ret['data']['data'];
          console.log("symbolList", options);
        }
      })
    },[]);

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
      if (userrole === "")
      {
        setRole(localStorage.getItem('userrole'));
      }
      else{
        setRole(userrole);
      }  
    },[username, useremail, userrole]);
  
    const initialList = [];
    const data = [];
    const [time, setTimeInterval] = React.useState(0); 
    //const time = 1000 * 30;
    const [value, setValue] = React.useState("");
    const [sectorvalue, setSectorValue] = React.useState("");
    const [symbol, setSymbol] = React.useState(initialList);
    const [state, setState] = React.useState(data);  
    const [status, setStatus] = React.useState(false);
    const [alertList, setAlertList] = React.useState([])
    const [exitList, setExitList] = React.useState([])
    const [earningList, setEarningList] = React.useState([])
    const [columndata, setColumnData] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [first, setFirst] = React.useState(true);
    const [publicIcon, setPublicIcon] = React.useState(false);
    const [timerId, setTimerId] = React.useState(null);
    const jwt = require('jwt-simple');
    const secret = "Hero-Hazan-Trading-Watchlist";
    const [size, setSize] = React.useState(5);

    React.useEffect(()=>{
      if (localStorage.key("TableSize") != null)
      {
        console.log("localsotrageSize", localStorage.getItem("TableSize"));
        setSize(localStorage.getItem("TableSize"));
      }
      else{
        setSize(5);
      }
    },[])
    React.useEffect(()=>{
      getstockpriceintervaltime().then(ret=>{
        if (ret['data']['result'] == 'ok'){
          setTimeInterval(parseInt(ret['data']['data']) * 1000 * 60);
          // setTimeInterval(1000 * 60 * 0.5);
        }
      })
    },[])

    React.useEffect(()=>{
      (symbol || []).map(item =>{

        setTimerId((prevTimerId) => {
          clearInterval(prevTimerId);
          return timerId;
        });
  
        let payload = {
          "symbol": item.symbol,
          "symbolname" : item.symbolname
        }
        
        console.log('payload1', payload);
        getcurrentstockprice(payload).then( ret=>{
          console.log("payload1ret", ret);
          // if (ret['data']['result'] === "failed" || state === undefined)
          // {
          //   return;
          // }
          setState(prevState => (prevState || []).map(item_ => {
            console.log("item_",item_, ret);
            const item = {...item_}
            if (item.symbolname === ret.data.symbolname) {
              item.currentstockprice = ret.data.price;
              if (item.currentstockprice === 0){
                item.currentchange = 0;                
              }
              else{
                item.currentchange =ret.data.pricechange;
              }
              item.addedpricechange = Math.round((item.currentstockprice - (parseFloat(item.addedprice))) / parseFloat(item.addedprice) * 100 * 1000) /1000;
              console.log('itementryprice', item.entryprice,typeof(item.entryprice), "float", parseFloat(item.entryprice));
              if (item.entryprice != "")
              {
                item.entrychange = Math.round((item.currentstockprice - (parseFloat(item.entryprice))) / parseFloat(item.entryprice) * 100 * 1000) /1000;
              }
              if (item.alertprice != null && item.alertprice != "0")
              {
                console.log("foralert",parseFloat(item.currentstockprice),parseFloat(item.alertprice),(parseFloat(item.currentstockprice) - parseFloat(item.alertprice))*100/parseFloat(item.alertprice))
                if (Math.abs((parseFloat(item.currentstockprice) - parseFloat(item.alertprice))*100/parseFloat(item.alertprice)) < parseFloat(item.alertpricechange)){
                  console.log("foralert",parseFloat(item.currentstockprice),parseFloat(item.alertprice),(parseFloat(item.currentstockprice) - parseFloat(item.alertprice))*100/parseFloat(item.alertprice))
                  setAlert("block", item.symbolname);
                  console.log("setnotification",userName, "https://financialmodelingprep.com/image-stock/"+item.symbol+".jpg",new Date().toISOString().substring(0, 10), "Alert!!! - " + item.symbol)
                  setNotification(userName, "https://financialmodelingprep.com/image-stock/"+item.symbol+".jpg",new Date().toISOString().substring(0, 10), "Alert!!! - " + item.symbol);
                    console.log("setearninglist")
                    setEarningList(()=>{
                      const _earninglist = earningList || [];
                      let flag = false;
                      (earningList||[]).map(items=>{
                        if (items.symbolname == item.symbolname)
                        {
                          flag = true;
                        }
                      })
                      if (flag == false){
                        _earninglist.push({"symbol":item.symbol,"symbolname":item.symbolname});
                      }
                      return _earninglist;
                    })
                    // (earningList||[]).push(item.symbol);
                    // console.log("earningList",earningList);  
                }
                else{
                  setEarningList(()=>{
                    const _earninglist = [];
                    (earningList||[]).map(items=>{
                      if (items.symbolname != item.symbolname){
                        _earninglist.push({"symbol":items.symbol,"symbolname":items.symbolname});
                      }
                    })
                    return _earninglist;
                  })
                }
              }
              console.log("endearninglist", earningList);
              return item;
            } else {
              return item;
            }
          }))  
        }, err => {
          alert(err.error);
        });       
      });
      if (time != 0)
      {
        const timerId = setInterval(() => {
          (symbol || []).map(item =>{
            let payload = {
                "symbol": item.symbol,
                "symbolname" : item.symbolname
              }
            
              console.log('payload', payload);
              getcurrentstockprice(payload).then( ret=>{
                console.log("ret",ret);
                // if (ret['data']['result'] === "failed" || state === undefined)
                // {
                //   console.log("failed");
                //   return;
                // }
                setState(prevState => (prevState || []).map(item_ => {
                  console.log("item_", item_);
                  const item = {...item_}
                  if (item.symbolname === ret.data.symbolname) {
                    item.currentchange =ret.data.pricechange;
                    item.currentstockprice = ret.data.price;
                    item.addedpricechange = Math.round((item.currentstockprice - (parseFloat(item.addedprice))) / parseFloat(item.addedprice) * 100 * 1000) /1000;
                    if (item.entryprice != "")
                    {
                      item.entrychange = Math.round((item.currentstockprice - (parseFloat(item.entryprice))) / parseFloat(item.entryprice) * 100 * 1000) /1000;
                    }
                    if (item.alertprice != null && item.alertprice != "0")
                    {
                      if (Math.abs((parseFloat(item.currentstockprice) - parseFloat(item.alertprice))*100/parseFloat(item.alertprice)) < parseFloat(item.alertpricechange)){
                        setAlert("block", item.symbol);
                        setNotification(userName, "https://financialmodelingprep.com/image-stock/"+item.symbol+".jpg",new Date().toISOString().substring(0, 10), "Alert!!! - " + item.symbol);
                        setEarningList(()=>{
                          const _earninglist = earningList || [];
                          let flag = false;
                          (earningList||[]).map(items=>{
                            if (items.symbolname == item.symbolname)
                            {
                              flag = true;
                            }
                          })
                          if (flag == false){
                            _earninglist.push({"symbol":item.symbol,"symbolname":item.symbolname});
                          }
                          return _earninglist;
                        })
                          // (earningList||[]).push(item.symbol);
                        // console.log("earningList",earningList);  
                      }
                      else{
                        setEarningList(()=>{
                          const _earninglist = [];
                          (earningList|| []).map(items=>{
                            if (items.symbolname != item.symbolname){
                              _earninglist.push({"symbol":items.symbol, "symbolname":items.symbolname});
                            }
                          })
                          return _earninglist;
                        })
                      }    
                    }
                    console.log("endearninglist", earningList);
                    return item;
                  } else {
                    return item;
                  }
                }))  
            }, err => {
              alert(err.error);
            });       
          });
        }, time);
      }
      // setTimerId((prevTimerId) => {
      //   clearInterval(prevTimerId);
      //   return timerId;
      // });
      // setStatus(()=>{
      //   return !status;
      // });
    },[symbol, status, time])

      const getColumns = useCallback(() => {
          return [
            { title: 'Symbol', field: 'symbol', editable: 'onAdd', hidden:!columndata['symbol'], 
            editComponent: props => (
              <Autocomplete
              id="virtualize-demo"
              disableListWrap
              classes={classes}
              ListboxComponent={ListboxComponent}
              renderGroup={renderGroup}
              options={options}
              style={{ width: 150 }}
              type="text"
              value={props.value}
              groupBy={(option) => option[0].toUpperCase()}

             
              onChange={(e, newvalue) => {
                setLoading(true);
                  //setTimer(false);
                  props.onChange(newvalue);
                  
  
                  let payload = {
                    "symbol": newvalue,
                  };
              
                getsector(payload).then( ret=>{
                  setLoading(false);
                if (ret['data'].result === 'ok'){
                    if (sectorOptions.length > 0)
                    {
                        sectorOptions.pop();
                    }
                    // if (ret['data']['sector'] === "")
                    // {
                    //   props.onChange("");
                    // }
                    sectorOptions.push(ret['data']['sector']);
                    setSectorValue(ret['data']['sector']);
                }
                else if(ret['data'].result === 'fail'){
                    alert(ret['data'].message);
                }
                else {
                    alert(ret['data'].error);
                }
                }, err => {
                alert(err.error);
                });                    
            }}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Symbol" />}
              renderOption={(option) => <Typography noWrap>{option}</Typography>}/>            
            ) },
            { title: 'Sector', field: 'sector',  editable: 'Never',hidden:!columndata['sector'],
                  editComponent:props => (
                    <TextField 
                      id="outlined-basic" 
                      label="Outlined" 
                      variant="outlined" 
                      value={sectorvalue}
                      onChange={e=>{
                        console.log(e);
                      }}
                    />
                  )
              },
            {
              title: 'Trade\nTiming',
              field: 'tradetiming',
              lookup: { 0: 'Today', 1: 'Next Day' },
              hidden:!columndata['tradetiming'],
            },
            {
              title: 'Short\n/Long',
              field: 'shortorlong',
              lookup: { 0: 'Short', 1: 'Long' },
              hidden:!columndata['shortorlong'],
            },
            {
              title: 'Trade\nTime\nframe',
              field: 'tradetimeframe',
              lookup: { 0: 'Intra day', 1: 'Swing', 2:'Position' },
              hidden:!columndata['tradetimeframe'],
            },
            { title: '52\nWeeks\nHigh', field: 'yearhigh',editable: 'never', type: 'numeric', searchable:false ,hidden:!columndata['yearhigh']},
            { title: 'SymbolName', field: 'symbolname',editable: 'never', searchable:false ,hidden:true},
            { title: 'Current\nStock\nPrice', field: 'currentstockprice',editable: 'never', type: 'numeric', searchable:false ,hidden:!columndata['currentprice']},
            { title: 'Change', field: 'currentchange', type: 'numeric',editable: 'never', searchable:false,hidden:!columndata['currentchange'], width:200,
              cellStyle: (index, rowdata) => {
                if (index > 0) {
                  return ({color:"green"});
                }
                if (index == 0){
                  return ({color:"black"});
                }
                else{
                  return ({color:"red"});
                }
              }
            },
            { title: 'Entry\nPrice', field: 'entryprice', type: 'numeric' , searchable:false,hidden:!columndata['entryprice']},
            { title: 'Change', field: 'entrychange', type: 'numeric',editable: 'never', searchable:false,hidden:!columndata['entrychange'],
              cellStyle: (index, rowdata) => {
              }
            },
            { title: 'Stop\nLoss', field: 'stoploss', type: 'numeric' , searchable:false,hidden:!columndata['stoploss']},
            { title: 'Change', field: 'stopchange', type: 'numeric' , editable: 'never',searchable:false,hidden:!columndata['stoplosschange']},
            { title: 'Exit\nPrice', field: 'exitprice', type: 'numeric' , searchable:false,hidden:!columndata['exitprice']},
            { title: 'Earning\nReportDate', field:'earningdate', type:'date', editable:'never', searchable:false,hidden:!columndata['earningdate'],
              cellStyle: (index, rowdata) =>{
                let bufIndex = [];
                if (rowdata != undefined && alertList != undefined){
                  for (var i = 0; i < (alertList || []).length; i++)
                  {
                    if (rowdata.symbolname === alertList[i].symbolname){
                      return ({backgroundColor: "#ffcdd2"});
                    }
                  }  
                }
                else{
                  return ({backgroundColor: "#ffffff"});
                }
              }
              // cellStyle:{
              //   backgroundColor: '#039be5',
              // }
            },
            { title: 'Alert\nPrice', field: 'alertprice', type: 'numeric' , searchable:false,hidden:!columndata['alertprice'],
              cellStyle: (index, rowdata) =>{
                let bufIndex = [];
                if (rowdata != undefined && earningList != undefined) {
                  for (var i = 0; i < (earningList||[]).length; i++)
                  {
                    if (rowdata.symbolname === earningList[i].symbolname){
                      return ({backgroundColor: "#ffcdd2"});
                    }
                  }  
                }
                else{
                  return ({backgroundColor: "#ffffff"});
                }
              }          
            },
            { title: 'Alert\nPrice\nChange', field: 'alertpricechange', type: 'numeric',  searchable:false ,hidden:!columndata['alertprice']},
            { title: 'Reward\nInR', field: 'rewardprice', type: 'numeric',  editable: 'never', searchable:false ,hidden:!columndata['rewardinR']},
            { title: 'Initial\nPrice', field: 'addedprice', type: 'numeric',  editable: 'never', searchable:false ,hidden:!columndata['addedprice']},
            { title: 'Added\nChange', field: 'addedpricechange', type: 'numeric',  editable: 'never', searchable:false ,hidden:!columndata['addedpricechange']},
            { title: 'Date Added', field: 'dateadded', type: 'date',  editable: 'never', searchable:false ,hidden:!columndata['dateadded']},
            { title: 'Comment', field: 'comment', type:'string', hidden:!columndata['comment'],
              editComponent: props => (
                <TextField
                id="standard-multiline-static"
                multiline
                value={props.value}
                rows={6}
                onChange={(e)=>{
                  if (e.target.value.length < 100)
                  {
                    props.onChange(e.target.value);
                  }
                }}
              />              
              )
            },
            {
              title: 'Trade\nScore',
              field: 'tradescore',
              lookup: { 0: 'A', 1: 'B', 2:'C', 3:'D', 4:'E' },
              hidden:!columndata['tradescore'],
            },
          ];
      }, [columndata, earningList, alertList])

      React.useEffect(() => {
        if (!userName.length || !userEmail.length) return;
        let payload = {
          "username": userName,
          "useremail" : userEmail,
        }
        let token = jwt.encode(payload, secret);
        console.log("token", token);
        payload = {"token": token};
        getwatchlisttemplate(payload).then(ret=>{
          ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
          if (ret['data'].result === 'ok')
          {
            setColumnData(ret['data']['data']);
              getWatchlist(payload).then( ret=>{
                ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
                console.log('getwachlist return', ret);
                setState((ret?.data?.data || []).map(item=>{
                  if (item.earningdate != ""){
                    item.earningdate = new Date(item.earningdate);
                    if (item.earningflag === true)
                    {
                      console.log("earningreportdatapush")
                      alertList.push({"symbol":item.symbol,"symbolname":item.symbolname});
                    }
                  }
                  if (parseFloat(item['exitprice']) > 0){
                    console.log("aavv");
                    exitList.push({"symbol":item.symbol,"symbolname":item.symbolname});
                  }
                  if (item['viewstatus'] === "True"){
                    setPublicIcon(true);
                  }
                  else{
                    setPublicIcon(false);
                  }
                  return item;  
                }))
                if (first === true)
                {
                  setSymbol(()=>{
                    const symboldata = [...symbol];
                    (ret?.data?.data || []).map(item=>{
                      symboldata.push({"symbol":item.symbol,"symbolname":item.symbolname});
                    });

                    console.log('symbol data changed', symboldata);
                    return symboldata;
                  })
                }
                // else{
                //   setSymbol(()=>{
                //     let symboldata = [...symbol];
                //     return symboldata;
                //   })
                // }
              }, err => {
              });  
          }
          if (ret['data'].result === 'failed db')
          {
            return (
              <RouterLink to='/settings' />
            )
          }
        }, err=>{

        });
      }, [userName, userEmail, status])

      const DrageState = {
        row: -1,
        dropIndex: -1 // drag target
      };

      //Reorder the table row
      const offsetIndex = (from, to, arr = []) => {
        if (from < to) {
          let start = arr.slice(0, from),
            between = arr.slice(from + 1, to + 1),
            end = arr.slice(to + 1);
          return [...start, ...between, arr[from], ...end];
        }
        if (from > to) {
          let start = arr.slice(0, to),
            between = arr.slice(to, from),
            end = arr.slice(from + 1);
          return [...start, arr[from], ...between, ...end];
        }
        return arr;
      }
      const reOrderRow = (from, to) =>{
      let newtableData = offsetIndex(from, to, state);
      console.log("newtabledata", newtableData, from, to);
      //Update react state
      setState(newtableData);
      let payload = {
        "useremail" : userEmail,
        "from" : from,
        "to" : to,
        "fromsymbolname" : newtableData[to]['symbolname']
      }
      let token = jwt.encode(payload, secret);
      payload = {"token": token};
      saveroworder(payload).then(ret=>{
        if (ret['data']['result'] == 'ok') {
          console.log("rowordersavesuccessful");
        }
        else {
          console.log("rowordersavefailed");
        }
      })

      }
      
    return (
            <MaterialTable 
            title="Watchlist for stock market"
            columns={getColumns()}
            //data={getListData()}  
            data={state}
            isLoading={loading}
            components={{
              Row: props => (
                  <MTableBodyRow {...props}
                      draggable="true"
                      onDragStart={(e) => {
                          DrageState.row = props.data.tableData.id
                      }}
                      onDragEnter={e => {
                          e.preventDefault();
                          console.log(`onDragEnter`);
                          if( props.data.tableData.id !== DrageState.row){
                              DrageState.dropIndex = props.data.tableData.id ;
                          }                                                  
                      }}
                      onDragEnd={(e) => {
                          console.log(`onDragEnd`, DrageState.row, DrageState.dropIndex);
                          if(DrageState.dropIndex !== -1){
                              reOrderRow(DrageState.row, DrageState.dropIndex)
                          }
                          DrageState.row = -1;
                          DrageState.dropIndex = -1;
                      }}
                  />
              )
          }} // components
            options={{
              rowStyle:{
                padding:'1px',
              },
              padding:densestring,
              doubleHorizontalScroll:true,
              paging:true,
              pageSize: (localStorage.getItem("TableSize") || 5),
              emptyRowsWhenPaging:false,
              paginationType:'stepped',
              addRowPosition:'first',
              rowStyle: (data, index) =>{
                let bufIndex = [];
                (exitList || []).map(item=>{
                  if (item.symbolname === data.symbolname)
                  {
                    bufIndex.push(index);
                  }
                })
                for (var i=0; i<bufIndex.length; i++)
                {
                  if (index === bufIndex[i])
                  {
                    return {padding:'1px', backgroundColor: "#26c6da", fontSize:"14px", fontFamily:"'Open Sans', sans-serif", height:"20px", paddingTop:"0px", paddingBottom:"0px" }
                  }  
                }
                return { padding:'1px', fontSize:"14px", fontFamily:"'Open Sans', sans-serif", paddingTop:"0px", paddingBottom:"0px" }
              }

            }}
            onChangeRowsPerPage={pageSize=>{
              console.log("rowperpage", pageSize);
              localStorage.setItem("TableSize", pageSize);
              setTableSize(pageSize);
            }}
            onColumnDragged={(sourceIndex, destinationIndex)=>{
              console.log("source", sourceIndex);
              console.log("dest", destinationIndex);
            }}
            detailPanel={rowData => {
                // setSymbolName(rowData['symbol']);
                // console.log("rowdata",rowData['symbol']);
                console.log("width", width);
                var bwidth = parseInt(width) - 120;
                bwidth = bwidth.toString() + "px";
                console.log("bwidth", bwidth);
                return (
                    <div height="80%" style={{marginLeft:"25px", marginRight:"20px", marginBottom:"10px", display:"flex", width:bwidth}}>
                        <TradingViewWidget symbol={rowData['symbol']}/>
                    </div>
                    )
              }}
              // actions={[
              //   {
              //     icon: publicIcon? CheckBoxIcon: CheckBoxOutlineBlankIcon,
              //     tooltip: 'Set private/public',
              //     onClick: (event, rowData) => {
              //       let payload = {
              //         "username": userName,
              //         "useremail": userEmail,
              //         "symbol": rowData['symbol'],
              //         "status" : !publicIcon,
              //       }
              //       setPublicIcon(!publicIcon);
              //       console.log("status", payload['status'])
              
              //       changeViewStatus(payload).then( ret=>{
              //         if (ret['data'].result === 'ok'){
              //           console.log("aa", ret['data']);
              //         }
              //         else if (ret['data'].result === 'fail')
              //         {
              //           alert(ret['data'].message);
              //         }
              //         else{
              //           alert(ret['data'].error);
              //         }
              //       }, err => {
              //         alert(err.error);
              //       });    
              //       return   (
              //         <div>
              //           <br />
              //           <Alert>aaa</Alert>
              //           {/* <SnackbarContent  message={'SUCCESS - This is a regular notification made with color="success"'} close color="success" icon={AddAlert}/> */}
              //         </div>  
              //       )                          
              //     }
              //   },
              // ]}
              onRowClick={(event, rowData, togglePanel) =>{
              console.log("selected symbol", rowData['symbol']);
              // setSymbolName(rowData['symbol']);
              togglePanel();
            }}
            onInputChange={(event, rowData) => console.log(rowData)}
            editable={{
                    onRowAdd: (newData) =>
                    new Promise((resolve) => {
                        var bufsymbol;
                        var jwt = require('jwt-simple');
                        let secret = "Hero-Hazan-Trading-Watchlist";  
                          resolve();
                          setFirst(false);
                          var symbolnamebuf;
                          var bufsymbol;
                          // setState((prevState) => {
                            setLoading(true);
                              // console.log("prevdata", prevState);
                              // const datas = [...prevState];
                              if (newData['entryprice']===undefined)
                              {
                                newData['entryprice'] = 0;
                              }
                              if (newData['entrychange']===undefined)
                              {
                                newData['entrychange'] = 0;
                              }
                              if (newData['stoploss']===undefined)
                              {
                                newData['stoploss'] = 0;
                              }
                              if (newData['exitprice']===undefined)
                              {
                                newData['exitprice'] = 0;
                              }
                              if (newData['currentstockprice']===undefined)
                              {
                                newData['currentstockprice'] = 0;
                              }
                              if (newData['currentchange']===undefined)
                              {
                                newData['currentchange'] = 0;
                              }
                              if (newData['addedprice']===undefined)
                              {
                                newData['addedprice'] = 0;
                              }
                              if (newData['comment']===undefined)
                              {
                                newData['comment'] = "";
                              }
                              if (newData['earningdate'] === undefined)
                              {
                                newData['earningdate'] = "";
                              }
                              if (newData['alertpricechange'] === undefined)
                              {
                                newData['alertpricechange'] = 5.0;
                              }
                              if (newData['exitprice'] != 0){
                                exitList.push({"symbol":newData['symbol'],"symbolname":newData['symbolname']});
                              }
                              let today = new Date();
                              let dd = String(today.getDate()).padStart(2, '0');
                              let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                              let yyyy = today.getFullYear();
  
                              today = mm + '/' + dd + '/' + yyyy;
                              newData['dateadded'] = today;
                              if (newData['exitprice'] != 0 && newData['stoploss'] !=0 && newData['entryprice']!=0){
                                newData['rewardprice'] =(parseFloat(newData['exitprice']) - parseFloat(newData['entryprice'])) / (parseFloat(newData['entryprice']) - parseFloat(newData['stoploss'])) ;
                                newData['rewardprice'] = newData['rewardprice'].toString().substring(0,4);
                              }
                              else{
                                newData['rewardprice'] = 0;
                              }
                              // while(sectorvalue === "")
                              // {
                              //   return;
                              // }
                              newData['sector'] = sectorvalue;
                              console.log("new data", newData);
                              if (newData['symbol'] === undefined)
                              {
                                alert("No symbol. Please select the symbol...");
                              }
                              else{
                                let payload2 = {
                                  "username": userName,
                                  "useremail": userEmail,
                                  "userrole": userRole,
                                }
                                let token2 = jwt.encode(payload2, secret);
                                payload2 = {"token": token2};      
                                validwatchlist(payload2).then(ret=>{
                                  ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
                                  if(ret['data'].result === 'ok'){
                                    // datas.push(newData);
  
                                    let payload = {
                                      "username": userName,
                                      "useremail": userEmail,
                                      "symbol": newData['symbol'],
                                      "symbolname": new Date().getTime().toString(),
                                      "sector": newData['sector'],
                                      "tradetiming": newData['tradetiming'],
                                      "shortorlong": newData['shortorlong'],
                                      "tradetimeframe": newData['tradetimeframe'],
                                      "entryprice": newData['entryprice'],
                                      "stoploss": newData['stoploss'],
                                      "exitprice": newData['exitprice'],
                                      "alertprice": newData['alertprice'],
                                      "alertpricechange": newData['alertpricechange'],
                                      "rewardprice": newData['rewardprice'],
                                      "dateadded" : newData['dateadded'],
                                      "comment" : newData['comment'],
                                      "viewstatus" : "True",
                                      "tradescore" : newData['tradescore'],
                                    }
                                    symbolnamebuf = payload['symbolname'];
                                    bufsymbol = payload['symbol'];
                                    let token = jwt.encode(payload, secret);
                                    payload = {"token": token};      
                                    saveWatchlist(payload).then( ret=>{
                                      ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
                                      if (ret['data'].result === 'ok'){
                                        setStatus((prevstatus)=>{
                                          return !prevstatus;
                                        });
                                        // setSymbol((prevSymbol)=>{
                                        //   const symboldata = [...prevSymbol];
                                        //   symboldata.push({"symbol":bufsymbol, "symbolname":symbolnamebuf});
                                        //   console.log("symboldatapush", symboldata);
                                        //   return symboldata;
                                        // });                        
                                        setLoading(false);
                                        // refreshPage();
                                        // return  datas;
                                      }
                                      else if(ret['data'].result === 'fail'){
                                        alert(ret['data'].message);
                                      }
                                      else {
                                        alert(ret['data'].error);
                                      }
                                    }, err => {
                                      alert(err.error);
                                    });  
                                  }
                                  // else if(ret['data'].result === 'fail'){
                                  //   alert(ret['data'].msg);
                                  // }
                                  // else {
                                  //   alert(ret['data']['error']);
                                  // }
                                }, err=>{
                                  alert(err.error);
                                })    
                                setLoading(false);
                                // return datas;
                              }
                          // });
                          setSymbol((prevSymbol)=>{
                            const symboldata = [...prevSymbol];
                            symboldata.push({"symbol":bufsymbol, "symbolname":symbolnamebuf});
                            console.log("symboldatapush", symboldata);
                            return symboldata;
                          });                        
                          resolve();                        
                    }),
                    onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                        resolve();
                        var jwt = require('jwt-simple');
                        let secret = "Hero-Hazan-Trading-Watchlist";  
                        if (oldData) {
                            // setState((prevState) => {
                            const data = [...state];
                            data[data.indexOf(oldData)] = newData;
                            console.log("oldData", oldData);
                            console.log("newData",newData);
                            if (newData['exitprice'] != 0){
                              exitList.push({"symbol":newData['symbol'],"symbolname":newData['symbolname']});
                            }
                            if (newData['exitprice'] != 0 && newData['stoploss'] !=0 && newData['entryprice']!=0){
                              newData['rewardprice'] =(parseFloat(newData['exitprice']) - parseFloat(newData['entryprice'])) / (parseFloat(newData['entryprice']) - parseFloat(newData['stoploss'])) ;
                              newData['rewardprice'] = newData['rewardprice'].toString().substring(0,4);
                            }
                            else{
                              newData['rewardprice'] = 0;
                            }
                            if (newData['alertpricechange'] === undefined)
                            {
                              newData['alertpricechange'] = 5;
                            }

                            let payload = {
                              "username": userName,
                              "useremail": userEmail,
                              "symbol": newData['symbol'],
                              "symbolname": newData['symbolname'],
                              "sector": newData['sector'],
                              "tradetiming": newData['tradetiming'],
                              "shortorlong": newData['shortorlong'],
                              "tradetimeframe": newData['tradetimeframe'],
                              "entryprice": newData['entryprice'],
                              "stoploss": newData['stoploss'],
                              "exitprice": newData['exitprice'],
                              "alertprice": newData['alertprice'],
                              "alertpricechange": newData['alertpricechange'],
                              "rewardprice": newData['rewardprice'],
                              "comment" : newData['comment'],
                              "earningdate" : newData['earningdate'],
                              "tradescore" : newData['tradescore'],
                            }
                            let token = jwt.encode(payload, secret);
                            payload = {"token": token};      
                            updateWatchlist(payload).then( ret=>{
                              ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
                              if (ret['data'].result === 'ok'){
                                console.log(ret['data']);
                                setAlert("none", newData['symbol']);
                                setStatus((prevstatus)=>{
                                  return !prevstatus;
                                });
                                // refreshPage();
                              }
                              else if(ret['data'].result === 'fail'){
                                alert(ret['data'].message);
                              }
                              else {
                                alert(ret['data'].error);
                              }
                            }, err => {
                              alert(err.error);
                            });                                
                            // return data;
                            // });
                        }
                        else{
                            return "error";
                        }
//                        setTimer(true);
                    }),
                    onRowDelete: (oldData) =>
                    new Promise((resolve) => {
                        resolve();
                        console.log("deleteolddata", oldData['tableData']['id'])
                        var jwt = require('jwt-simple');
                        let secret = "Hero-Hazan-Trading-Watchlist";  
                        setFirst(false);
                        // setState((prevState) => {
                            // const datas = [...prevState];                            
                            // datas.splice(data.indexOf(oldData), 1);
                            let payload = {
                              "username": userName,
                              "useremail": userEmail,
                              "symbol": oldData['symbol'],
                              "symbolname" : oldData['symbolname'],
                              "tradetiming" : oldData['tradetiming'],
                              "shortorlong" : oldData['shortorlong'],
                              "tradetimeframe" : oldData['tradetimeframe'],
                              "index" : oldData['tableData']['id']
                            }
                            let token = jwt.encode(payload, secret);
                            payload = {"token": token};      
                            deleteWatchlist(payload).then( ret=>{
                              ret['data'] = jwt.decode(ret['data']['result'].substring(2,ret['data']['result'].length - 2), secret, true);  
                              if (ret['data'].result === 'ok'){
                                console.log("deletewatchlist");
                                setStatus((prev)=>{
                                  console.log("prevstatus",prev);
                                  return !prev;
                                });
                                setSymbol(()=>{
                                  let symboldata = [...symbol]
                                  symboldata.pop({"symbolname":oldData['symbolname']});
                                  return symboldata;
                                });
                                // refreshPage();
                                // return datas ;
                              }
                              else if(ret['data'].result === 'fail'){
                                alert(ret['data'].message);
                              }
                              else {
                                alert(ret['data'].error);
                              }
                            }, err => {
                              alert(err.error);
                            });                                
                        // });
                      }),
                }}
            />            
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPageWidget);

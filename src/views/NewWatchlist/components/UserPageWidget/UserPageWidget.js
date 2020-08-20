import React, {useCallback} from 'react';
import MaterialTable, { MTableToolbar } from 'material-table';
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
import {getWatchlist,getsector, getcurrentstockprice, getsharewatchlisttemplate, getuserdata, getfollowers} from '../../../../services/api/httpclient';
import { connect } from "react-redux";
import { setSymbolName } from '../../../../redux/actions';
import { setAlert } from '../../../../redux/actions';
import { Link as RouterLink } from 'react-router-dom';


const mapStateToProps = state => {
  return { username:state.user.Wusername, useremail:state.user.Wuseremail, userrole:state.user.Wuserrole, userimage:state.user.Wuserimage};
};
function mapDispatchToProps(dispatch) {
  return {
    setSymbolName:payload => dispatch(setSymbolName(payload)),
    setAlert:(alertflag,alertsymbol) => dispatch(setAlert(alertflag, alertsymbol)),
  };
}

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#12213f',
        height : '100%',
        width: '100%',
        minHeight: '200px',
        padding: '0px',
        display: 'flex',
        position: 'relative',
        
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
    table: {
        width : '95%',
        position : 'relative',
        margin : '3% 2% 2%',
    }
}));

const options =sector;
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
  });

const sectorOptions=[];
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const UserPageWidget = (props) => {
    const { className, dispatch, setSymbolName, setAlert, watchid, width, userName, userEmail, userImage,myEmail, ...rest } = props;
    const [widgetType, setWidgetType] = React.useState(0);
    const handleChangeWidgetType = (type) => {
        if (type != null)
        {
            setWidgetType(type);
        }
    }
    const classes = useStyles1();
  
    const initialList = [];
    const data = [];
    const time = 1000 * 60 * 5;
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
    

    React.useEffect(()=>{
      symbol.map(item =>{
        let payload = {
          "symbol": item,
        }
        
        console.log('payload1', payload);
        getcurrentstockprice(payload).then( ret=>{
          console.log(ret);
          // if (ret['data']['result'] == "failed" || state == undefined)
          // {
          //   return;
          // }
          setState(prevState => prevState.map(item_ => {
            console.log("item_",item_);
            const item = {...item_}
            if (item.symbol == ret.data.symbol) {
              if (item.currentstockprice == 0){
                item.currentchange = 0;                
              }
              else{
                item.currentchange =ret.data.pricechange;
              }
              item.currentstockprice = ret.data.price;
              item.addedpricechange = Math.round((item.currentstockprice - (parseFloat(item.addedprice))) / parseFloat(item.addedprice) * 100 * 1000) /1000;
              if (item.alertprice != null && item.alertprice != "0")
              {
                if ((parseFloat(item.currentstockprice) - parseFloat(item.alertprice))*100/parseFloat(item.alertprice) > 2.0){
                  setAlert("block", item.symbol);
                  earningList.push(item.symbol);
                }
              }
              return item;
            } else {
              return item;
            }
          }))  
        }, err => {
          alert(err.error);
        });       
      });
      const timerID = setInterval(() => {
        symbol.map(item =>{
          let payload = {
            "symbol": item,
          }
          
            console.log('payload', payload);
            getcurrentstockprice(payload).then( ret=>{
              console.log("ret",ret);
              // if (ret['data']['result'] == "failed" || state == undefined)
              // {
              //   console.log("failed");
              //   return;
              // }
              setState(prevState => prevState.map(item_ => {
                console.log("item_", item_);
                const item = {...item_}
                if (item.symbol == ret.data.symbol) {
                  item.currentchange =ret.data.pricechange;
                  item.currentstockprice = ret.data.price;
                  item.addedpricechange = Math.round((item.currentstockprice - (parseFloat(item.addedprice))) / parseFloat(item.addedprice) * 100 * 1000) /1000;
                  if (item.alertprice != null && item.alertprice != "0")
                  {
                    if (parseFloat(item.currentstockprice) >= parseFloat(item.alertprice)){
                      setAlert("block", item.symbol);
                    }
                  }
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
      setTimerId((prevTimerId) => {
        clearInterval(prevTimerId);
        return timerID;
      });
      // setStatus(()=>{
      //   return !status;
      // });
    },[symbol])  
    React.useEffect(() => {
      if (!userName.length || !userEmail.length) return;
      console.log("newwatchlist username useremail", userName, userEmail)
      let payload = {
        "username": userName,
        "useremail" : userEmail,
      }      

      let payload1 = {
        'useremail' : userEmail
      }
      getuserdata(payload1).then(ret=>{
        console.log("sharemethod",ret['data']['data']['sharemethod']);
        if(ret['data']['result'] == 'ok'){
          if (ret['data']['data']['sharemethod'] == '2'){
            return;
          }
          if (ret['data']['data']['sharemethod'] == '1'){
            let payload2 = {
              'Suseremail' : myEmail,
              'Duseremail' : userEmail
            }
            getfollowers(payload2).then(ret=>{
              console.log("sharemethod1", ret['data']);
              if(ret['data']['result'] == 'failed'){
                return;
              }
              else{
                displaywatchlist(payload);
              }
            })
          }
          if(ret['data']['data']['sharemethod'] == '3'){
            console.log("sharemethodflag", userEmail, myEmail);
            console.log("sharemethodflag", userEmail, myEmail, payload);
            displaywatchlist(payload);
          }
        }
      })
 
    }, [userName, userEmail, status, myEmail])
    const displaywatchlist = (payload)=>{
      getsharewatchlisttemplate(payload).then(ret=>{
        console.log("sharedata", ret['data']);
        if (ret['data'].result == 'ok')
        {
          setColumnData(ret['data']['data']);
            getWatchlist(payload).then( ret=>{
              console.log('getwachlist return', ret);
              setState(ret.data.data.map(item=>{
                if (item.earningdate != ""){
                  item.earningdate = new Date(item.earningdate);
                  if (item.earningflag == true)
                  {
                    alertList.push(item.symbol);
                  }
                }
                if (parseFloat(item['exitprice']) > 0){
                  console.log("aavv");
                  exitList.push(item['symbol']);
                }
                if (item['viewstatus'] == "True"){
                  setPublicIcon(true);
                }
                else{
                  setPublicIcon(false);
                }
                return item;  
              }))
              if (first == true)
              {
                setSymbol(()=>{
                  const symboldata = [...symbol];
                  ret.data.data.map(item=>{
                    symboldata.push(item.symbol);
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
        if (ret['data'].result == 'failed db')
        {
          return (
            <RouterLink to='/settings' />
          )
        }
      }, err=>{

      });
    }
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
            if (ret['data'].result == 'ok'){
                if (sectorOptions.length > 0)
                {
                    sectorOptions.pop();
                }
                // if (ret['data']['sector'] == "")
                // {
                //   props.onChange("");
                // }
                sectorOptions.push(ret['data']['sector']);
                setSectorValue(ret['data']['sector']);
            }
            else if(ret['data'].result == 'fail'){
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
        { title: 'Current\nStock\nPrice', field: 'currentstockprice',editable: 'never', type: 'numeric', searchable:false ,hidden:!columndata['currentprice']},
        { title: 'Change', field: 'currentchange', type: 'numeric',editable: 'never', searchable:false,hidden:!columndata['currentchange'], width:200},
        { title: 'Entry\nPrice', field: 'entryprice', type: 'numeric' , searchable:false,hidden:!columndata['entryprice']},
        { title: 'Change', field: 'entrychange', type: 'numeric',editable: 'never', searchable:false,hidden:!columndata['entrychange']},
        { title: 'Stop\nLoss', field: 'stoploss', type: 'numeric' , searchable:false,hidden:!columndata['stoploss']},
        { title: 'Change', field: 'stopchange', type: 'numeric' , editable: 'never',searchable:false,hidden:!columndata['stoplosschange']},
        { title: 'Exit\nPrice', field: 'exitprice', type: 'numeric' , searchable:false,hidden:!columndata['exitprice']},
        { title: 'Earning\nReportDate', field:'earningdate', type:'date', editable:'never', searchable:false,hidden:!columndata['earningdate'],
          cellStyle: (index, rowdata) =>{
            let bufIndex = [];
            if (rowdata != undefined){
              for (var i = 0; i < alertList.length; i++)
              {
                if (rowdata.symbol == alertList[i]){
                  return ({backgroundColor: "#ffcdd2"});
                }
              }  
            }
          }
          // cellStyle:{
          //   backgroundColor: '#039be5',
          // }
        },
        { title: 'Alert\nPrice', field: 'alertprice', type: 'numeric' , searchable:false,hidden:!columndata['alertprice'],
          cellStyle: (index, rowdata) =>{
            let bufIndex = [];
            if (rowdata != undefined) {
              for (var i = 0; i < earningList.length; i++)
              {
                if (rowdata.symbol == earningList[i]){
                  return ({backgroundColor: "#ffcdd2"});
                }
              }  
            }
          }          
        },
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
  }, [columndata])
    return (
            <MaterialTable 
            title="Watchlist for stock market"
            columns={getColumns()}
            data={state}
            isLoading={loading}
            options={{
              rowStyle:{
                padding:'1px'
              },
              doubleHorizontalScroll:true,
              paging:true,
              addRowPosition:'first',
              rowStyle: (data, index) =>{
                let bufIndex = [];
                exitList.map(item=>{
                  if (item == data.symbol)
                  {
                    bufIndex.push(index);
                  }
                })
                for (var i=0; i<bufIndex.length; i++)
                {
                  if (index == bufIndex[i])
                  {
                    return {padding:'1px', backgroundColor: "#26c6da", fontSize:"14px", fontFamily:"'Open Sans', sans-serif", height:"20px", paddingTop:"0px", paddingBottom:"0px" }
                  }  
                }
                return { padding:'1px', fontSize:"14px", fontFamily:"'Open Sans', sans-serif", paddingTop:"0px", paddingBottom:"0px" }
              }

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
              onRowClick={(event, rowData, togglePanel) =>{
              console.log("selected symbol", rowData['symbol']);
              // setSymbolName(rowData['symbol']);
              togglePanel();
            }}
            onInputChange={(event, rowData) => console.log(rowData)}
            />
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPageWidget);
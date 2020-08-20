import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, withStyles } from '@material-ui/styles';
import {  Hidden, useMediaQuery } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { connect } from "react-redux";
import {setIntervaltime } from "../../../../../../../redux/actions/index.js";

import json2mq from 'json2mq';

function mapDispatchToProps(dispatch) {
  return {
    setIntervaltime:payload => dispatch(setIntervaltime(payload)),
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    backgroundColor: '#1b2d5e',
    height : '100%',
    width: '100%',
  },
  toggleIcon: {
    fontFamily: "Roboto-Medium",
    fontSize: '8pt',
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  searchClass:
  {

    marginLeft: '5px',
    border: '0px solid',
    width: '63px',
    height: '20px',
    
  },
  selectClass:
  {

    marginLeft: '5px',
    border: '0px solid',
    // width: '75px',
    minWidth: '75px',
    height: '20px',
    
  },
}));


const MyToggleButton = withStyles(theme => ({
  root: {
    textTransform: 'none',
    minHeight: '30px',
    fontWeight: theme.typography.fontWeightRegular,
    margin: '0px',
    minWidth: '10px',
    fontSize: '7.82pt',
    color: '#8eb4df',
    height: '100%',
    fontFamily: [
      'Roboto-Regular',
    ].join(','),
    '&:hover': {
      color: 'white',
    },
    '&$selected': {
      color: 'white',
      fontWeight: theme.typography.fontWeightMedium,
      backgroundColor: '#2d477a',
      '&:hover': {
        backgroundColor: '#2d477a'
      },
    },
    '&:focus': {
      color: 'white',
    }, 
    border: '0px solid #142347',   
  },
  selected: {},
}))(props => <ToggleButton disableRipple {...props} />);
const timeValues = [
  {key: 0, value: "1m"}, 
  {key: 1, value: "5m"}, 
  {key: 2, value: "15m"}, 
  {key: 3, value: "30m"}, 
  {key: 4, value: "1h"}, 
  {key: 5, value: "4h"}, 
  {key: 6, value: "1d"}, 
]
const TimeIntervalPanel = props => {
  const { className, tabChanged, openSidebar, setIntervaltime, ...rest } = props;

  const matches = useMediaQuery(
    json2mq({
      maxWidth: 1500,
    }),
  );
  const classes = useStyles();
  const [timevalue, setTimeValue] = React.useState(6);
  const handleChanged = (event, newAlignment) => {
    if (newAlignment !== null) {
      setTimeValue(newAlignment);
      setIntervaltime(timeValues[newAlignment].value);
      console.log("timevalues", timeValues[newAlignment].value);
    }
  };

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Hidden xsDown smDown mdDown >
     
      {openSidebar !== true && matches ? '' : <div style={{flex: 409, margin: '0px', padding: '0px'}}>
        <ToggleButtonGroup
          value={timevalue}
          exclusive
          onChange={handleChanged}
          style={{width: '100%', height: '100%', borderRadius: '0px', backgroundColor: 'transparent'}}
        >
          {timeValues.map((value) => (
            <MyToggleButton style={{padding: '5px', marginLeft: '5px', marginRight: '5px'}} key={value.key} value={value.key} className={classes.toggleButton}>
            <Icon className={classes.toggleIcon}>{value.value}</Icon>
            </MyToggleButton>
          ))}
        </ToggleButtonGroup>
     </div> }
     
      </Hidden>
    </div>
  );
};

TimeIntervalPanel.propTypes = {
  className: PropTypes.string
};

const mapStatesToProps = (state) => {
  return {
    ...state
  }
}

export default connect(mapStatesToProps, mapDispatchToProps)(TimeIntervalPanel);

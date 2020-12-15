import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {getearningstocks} from '../../../../services/api/httpclient';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton
} from '@material-ui/core';
import { before, after } from 'underscore';
import Axios from 'axios';
import lozad from 'lozad';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  },
  content: {
    padding: 0,
    maxHeight:'350px',
    minHeight:"350px",
    overflowY:'scroll'
  },
  image: {
    height: 48,
    width: 48,
  },
  actions: {
    justifyContent: 'flex-end'
  },
  img:{
    '$before':{
      display:'none'
    }
  }
}));

const EarningReportStocks = props => {
  const { className, products, ...rest } = props;
  const observer = lozad();
  observer.observe();
  const classes = useStyles();
  const getImagename=()=>{
    console.log("erorrmessage");
    return this.src='images/avatars/avatar_man.png';
  };
  const imgError = ((e) => {
    console.log("ImageError", e);
  })

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        subtitle={`${products.length} in total`}
        title="Earning Report Stocks(Today or Tomorrow)"
      />
      <Divider />
      <CardContent className={classes.content}>
        <List>
          {products.map((product, i) => (
            <ListItem
              divider={i < products.length - 1}
              key={product.id}
            >
              <ListItemAvatar style={{marginLeft:"10px"}}>
                <img
                  // className="lozad"
                  // width={48}
                  // height={48}
                  className={classes.image}
                  // data-src={product.imageUrl}
                  src={product.imageUrl}
                  onError={(e)=>{e.target.onerror = null; e.target.src="/images/avatars/null_symbol.png"}}
                />
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={product.date}
                style={{marginLeft:"10px"}}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Divider />
      {/* <CardActions className={classes.actions}>
        <Button
            color="primary"
            size="small"
            variant="text"
        >
          <ArrowLeftIcon /> Previous 
        </Button>
        <Button
          color="primary"
          size="small"
          variant="text"
        >
          Next <ArrowRightIcon />
        </Button>
      </CardActions> */}
    </Card>
  );
};

EarningReportStocks.propTypes = {
  className: PropTypes.string
};

export default EarningReportStocks;

import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  },
  content: {
    padding: 0,
    maxHeight:"350px",
    minHeight:"350px",
    overflowY:'scroll'
  },
  image: {
    height: 48,
    width: 48
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const TopStocks = props => {
  const { className, stocks, titleU, ...rest } = props;

  const classes = useStyles();

  // const [stocks] = useState(mockData);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        subtitle={`${stocks.length} in total`}
        title={titleU}
      />
      <Divider />
      <CardContent className={classes.content}>
        <List>
          {stocks.map((product, i) => (
            <ListItem
              divider={i < stocks.length - 1}
              key={product.id}
            >
              <ListItemAvatar style={{marginLeft:"10px"}}>
                <img
                  alt="Product"
                  className={classes.image}
                  src={product.imageUrl}
                  onError={(e)=>{e.target.onerror = null; e.target.src="/images/avatars/null_symbol.png"}}
                />
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={product.number}
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

TopStocks.propTypes = {
  className: PropTypes.string
};

export default TopStocks;

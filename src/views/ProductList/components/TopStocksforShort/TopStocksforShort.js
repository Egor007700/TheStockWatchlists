import React from 'react';
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
    height: '100%',
    width: '100%',
    marginTop:'20px'
  },
  content: {
    padding: 0,
    maxHeight:'350px',
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

const TopStocksforShort = props => {
  const { className, shortdata, ...rest } = props;

  const classes = useStyles();

  // const [products] = useState(mockData);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        subtitle={`${shortdata.length} in total`}
        title="Top Stocks for Short"
      />
      <Divider />
      <CardContent className={classes.content}>
        <List>
          {shortdata.map((product, i) => (
            <ListItem
              divider={i < shortdata.length - 1}
              key={product.id}
            >
              <ListItemAvatar>
                <img
                  alt="Product"
                  className={classes.image}
                  src={product.imageUrl}
                />
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={product.number}
              />
              <Button variant="outlined" color="primary" size="small">Detail</Button>
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

TopStocksforShort.propTypes = {
  className: PropTypes.string
};

export default TopStocksforShort;

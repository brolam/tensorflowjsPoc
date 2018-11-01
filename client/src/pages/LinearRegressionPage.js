import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Grid from '@material-ui/core/Grid';
import InputXForm from '../components/InputXForm'

const styles = theme => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    padding: `${theme.spacing.unit}px 0`,
  }
});

const data = [
  { x: 1, yReal: 1, yPredic: 1.2},
  { x: 2, yReal: 2, yPredic: 2.2},
  { x: 3, yReal: 3, yPredic: 3.2},
  { x: 4, yReal: 4, yPredic: 4.2},
  { x: 5, yReal: 5, yPredic: 5.2},
  { x: 6, yReal: 6, yPredic: 6.2},
  { x: 7, yReal: 7, yPredic: 7.2},
];


function LinearRegressionPage(props) {
  const {classes} = props
  return (
    <div className={classNames(classes.layout)}>
      <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputXForm />
          </Grid>
          <Grid item container direction="column" xs={12} sm={8}>
          <ResponsiveContainer width="99%" height={320}>
            <LineChart data={data} >
              <XAxis dataKey="x" />
              <YAxis dataKey="yReal"/>
              <YAxis dataKey="yPredic" />
              <CartesianGrid stroke="#ccc" />
              <Tooltip/>
              <Legend />
              <Line type="monotone" dataKey="yPredic" stroke="red" />
              <Line type="monotone" dataKey="yReal"  stroke="#82ca9d"  />
            </LineChart>
          </ResponsiveContainer>
          </Grid>
      </Grid>
    
    </div>
  );
}

LinearRegressionPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LinearRegressionPage);
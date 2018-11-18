import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Grid from '@material-ui/core/Grid';
import InputXForm from '../components/InputXForm'
import SequentialTrainStatus from '../components/SequentialTrainStatus'
import trainingsApi from '../trainingsApi'
import * as tf from '@tensorflow/tfjs';
import openSocket from 'socket.io-client';
import CircularProgress from '@material-ui/core/CircularProgress';
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
  },
  progressRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progress: {
    margin: theme.spacing.unit * 8,
  }
});

class LinearRegressionPage extends Component {
  loadModel = () => {
    tf.loadModel('http://localhost:8082/api/getSequentialTrainFile/model-1/model.json').then((model) => {
      this.trainedModel = model;
      let sequentialTrainData = this.state.sequentialTrainData;
      sequentialTrainData.forEach((item) => {
        item.yPredic = this.getPredict(item.x);
      })
      this.setSequentialTrainData(sequentialTrainData);
      clearInterval(this.timer);
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      sequentialTrainStatus: { epochs: 0, currentEpoch: 0, loss: 0, running: false },
      sequentialTrainData: [
        { x: 1, yReal: 1, yPredic: 1.2 },
        { x: 2, yReal: 2, yPredic: 2.2 },
        { x: 3, yReal: 3, yPredic: 3.2 },
        { x: 4, yReal: 4, yPredic: 4.2 },
        { x: 5, yReal: 5, yPredic: 5.2 },
        { x: 6, yReal: 6, yPredic: 6.2 },
        { x: 7, yReal: 7, yPredic: 7.2 },
      ]
    };
    const socket = openSocket("http://localhost:8082");
    socket.on('sequentialTrain', (trainStatus) => {
      this.setState({ sequentialTrainStatus: trainStatus });
      if (!trainStatus.running) this.timer = setInterval(this.loadModel, 1000);
    });
    this.loadModel();
  }

  componentDidMount() {
    //this.timer = setInterval(this.uiUpdate, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getPredict(x) {
    const yPredic = this.trainedModel.predict(tf.tensor2d([Number(x)], [1, 1]));
    return parseFloat(yPredic.dataSync()).toFixed(2);
  }

  setSequentialTrainData(sequentialTrainData) {
    this.setState({ sequentialTrainData: this.getDiffRealVsPredic(sequentialTrainData) });

  }

  getDiffRealVsPredic(sequentialTrainData) {
    sequentialTrainData.forEach((item) => {
      item.yDiff = parseFloat(item.yPredic / item.yReal * 100).toFixed(2);
    })
    return sequentialTrainData;
  }

  onSubmitXY = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const x = formData.get('x');
    const yReal = formData.get('y');
    const yPredic = this.getPredict(x);
    let sequentialTrainData = this.state.sequentialTrainData;
    sequentialTrainData.push({ x, yReal, yPredic });
    this.setSequentialTrainData(sequentialTrainData);
  };

  onSubmitDoTrain = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const trainProps = {
      epochs: formData.get('epochs'),
      data: this.state.sequentialTrainData
    };
    trainingsApi.doSequentialTrain(trainProps).then((res) => { this.setState({ sequentialTrainStatus: res }); });
  };

  render() {
    const { classes } = this.props
    return (
      <div className={classNames(classes.layout)}>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={4}>

            {
              (this.state.sequentialTrainStatus.running)
                ? <div className={classes.progressRoot}>
                  <CircularProgress className={classes.progress} />
                </div>
                : <InputXForm onSubmitXY={this.onSubmitXY} onSubmitDoTrain={this.onSubmitDoTrain} />
            }

          </Grid>
          <Grid item container direction="column" xs={12} sm={8}>
            <ResponsiveContainer width="99%" height={420}>
              <LineChart key={Math.random()} data={this.state.sequentialTrainData} >
                <XAxis dataKey="x" />
                <YAxis dataKey="yReal" />
                <YAxis dataKey="yPredic" />
                <YAxis dataKey="yDiff" />
                <CartesianGrid stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="yDiff" stroke="blue" />
                <Line type="monotone" dataKey="yPredic" stroke="red" />
                <Line type="monotone" dataKey="yReal" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
        {(this.state.sequentialTrainStatus.running) && <SequentialTrainStatus trainStatus={this.state.sequentialTrainStatus} />}
      </div>
    );
  }
}

LinearRegressionPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LinearRegressionPage);
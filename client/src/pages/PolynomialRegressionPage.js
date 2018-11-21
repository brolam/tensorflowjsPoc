import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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

class PolynomialRegressionPage extends Component {
  loadModel = () => {
    tf.loadModel('http://localhost:8082/api/getSequentialTrainFile/model-2/model.json').then((model) => {
      this.trainedModel = model;
      console.log(model)
      let polynomialTrainData = this.state.polynomialTrainData;
      polynomialTrainData.forEach((item) => {
        item.yPredic = this.getPredict(item.x);
      })
      this.setpolynomialTrainData(polynomialTrainData);
      clearInterval(this.timer);
    });
  }

  loadExamples = () => {
    trainingsApi.getPolynomialTrainExamples()
      .then(examples => this.setState({ polynomialTrainData: examples }));
    this.loadModel();
  }

  constructor(props) {
    super(props);
    this.state = {
      sequentialTrainStatus: { epochs: 0, currentEpoch: 0, loss: 0, running: false },
      polynomialTrainData: [{ x: 100, yReal: 200 }, { x: 120, yReal: 100 },
      { x: 180, yReal: 300 }, { x: 140, yReal: 250 },
      { x: 150, yReal: 400 }, { x: 110, yReal: 280 }]
    };
    const socket = openSocket("http://localhost:8082");
    socket.on('sequentialTrain', (trainStatus) => {
      this.setState({ sequentialTrainStatus: trainStatus });
      if (!trainStatus.running) this.timer = setInterval(this.loadModel, 1000);
    });
    this.loadExamples();
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

  setpolynomialTrainData(polynomialTrainData) {
    this.setState({ polynomialTrainData: this.getDiffRealVsPredic(polynomialTrainData) });

  }

  getDiffRealVsPredic(polynomialTrainData) {
    polynomialTrainData.forEach((item) => {
      item.yDiff = parseFloat(item.yPredic / item.yReal * 100).toFixed(2);
    })
    return polynomialTrainData;
  }

  onSubmitXY = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const x = formData.get('x');
    const yReal = formData.get('y');
    const yPredic = this.getPredict(x);
    let polynomialTrainData = this.state.polynomialTrainData;
    polynomialTrainData.push({ x, yReal, yPredic });
    this.setpolynomialTrainData(polynomialTrainData);
  };

  onSubmitDoTrain = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const trainProps = {
      epochs: formData.get('epochs'),
      numNodes: 20,
      data: this.state.polynomialTrainData,
    };
    trainingsApi.doPolynomialTrain(trainProps).then((res) => { this.setState({ sequentialTrainStatus: res }); });
  };

  render() {
    const { classes } = this.props
    const polynomialTrainDataReal = Array.from(this.state.polynomialTrainData).map((item) => {
      return { x: item.x, y: item.yReal };
    });

    const polynomialTrainDataPredic = Array.from(this.state.polynomialTrainData).map((item) => {
      return { x: item.x, y: item.yPredic };
    });

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
            <ScatterChart  key={Math.random()} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis dataKey={'x'} type="number" name='X' />
              <YAxis dataKey={'y'} type="number" name='y' />
              <Scatter name='Real' data={polynomialTrainDataReal} fill='#8884d8' />
              <Scatter name='Predic' data={polynomialTrainDataPredic} fill='#82ca9d' shape="diamond"/>
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            </ScatterChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
        {(this.state.sequentialTrainStatus.running) && <SequentialTrainStatus trainStatus={this.state.sequentialTrainStatus} />}
      </div>
    );
  }
}

PolynomialRegressionPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PolynomialRegressionPage);
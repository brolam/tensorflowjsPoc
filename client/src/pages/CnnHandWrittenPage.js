import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
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
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 1}px 0`,
  },
  card: {
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContentMida: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  cardContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  canvasImage: {
    height: '68',
    width: '68',
  },
  marginBadge: {
    margin: theme.spacing.unit * 2,
  }
});

class CnnHandWrittenPaga extends Component {
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
    trainingsApi.getCnnHandWrittenExamples(100)
      .then(examples => this.setState({ dataTraining: examples }));
    //this.loadModel();
  }

  constructor(props) {
    super(props);
    this.state = {
      sequentialTrainStatus: { epochs: 0, currentEpoch: 0, loss: 0, running: false },
      dataTraining: { labels: [], images: [] }
    };
    const socket = openSocket("http://localhost:8082");
    socket.on('sequentialTrain', (trainStatus) => {
      this.setState({ sequentialTrainStatus: trainStatus });
      if (!trainStatus.running) this.timer = setInterval(this.loadModel, 1000);
    });
    this.loadExamples();
  }

  componentDidUpdate() {
    console.log(this.state.dataTraining.images);
    this.state.dataTraining.images.forEach((image, index) => {
      this.drawImage(image, `canvas${index}`);
      console.log(index);
    })
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

  drawImage(image, canvasId) {
    const canvas = document.getElementById(canvasId);
    const [width, height] = [28, 28];
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image;
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = data[i] * 255;
      imageData.data[j + 1] = data[i] * 255;
      imageData.data[j + 2] = data[i] * 255;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
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
    const { classes } = this.props;
    const dataTraining = this.state.dataTraining;
    console.log(dataTraining);
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
            <Grid container spacing={8}>
              {dataTraining.labels.map((label, index) => (
                <Grid item key={index} sm={1} md={1} lg={1}>
                  <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {label[0]}
                      </Typography>

                      <div className={classes.cardContentMida} >
                        <Badge className={classes.marginBadge} badgeContent={label[0]} color="primary">
                          <canvas id={`canvas${index}`} className={classes.canvasImage} />
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        {(this.state.sequentialTrainStatus.running) && <SequentialTrainStatus trainStatus={this.state.sequentialTrainStatus} />}
      </div>
    );
  }
}

CnnHandWrittenPaga.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CnnHandWrittenPaga);
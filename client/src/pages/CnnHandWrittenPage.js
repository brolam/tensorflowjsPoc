import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import InputExamples from '../components/InputExamples'
import SequentialTrainStatus from '../components/SequentialTrainStatus'
import trainingsApi from '../trainingsApi'
import * as tf from '@tensorflow/tfjs';
import openSocket from 'socket.io-client';
import CircularProgress from '@material-ui/core/CircularProgress';
import TablePagination from '@material-ui/core/TablePagination';

const IMAGE_HEIGHT = 28;
const IMAGE_WIDTH = 28;

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

  loadModel = async () => {
    this.trainedModel = await tf.loadModel('http://localhost:8082/api/getSequentialTrainFile/model-3/model.json');
    const { images, labels } = this.state.dataTraining;
    let labelsPredicted = [];
    images.forEach((image, index) => {
      const predicted = this.getPredict(image);
      const predictedLabel = predicted.argMax(1).dataSync();
      labelsPredicted.push({ label: predictedLabel, predicted: predicted.dataSync() });
      console.log(`label:${labels[index][0]} pValue:${predicted.argMax(1).dataSync()} predicted:${predicted.dataSync()}`);
    })
    this.setDataTraining({ images, labels, labelsPredicted });
    clearInterval(this.timer);
  }

  loadExamples = () => {
    this.setState({ loadRunning: true });
    trainingsApi.getCnnHandWrittenTrainExamples(this.state.amountTraining)
      .then(examples => {
        this.setState({ dataTraining: examples })
        this.loadModel();
        this.setState({ loadRunning: false });
      }).catch(reason => {
        this.setState({ loadRunning: false });
        console.log(reason);
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      sequentialTrainStatus: { epochs: 0, currentEpoch: 0, loss: 0, running: false },
      loadRunning: false,
      amountTraining: 50,
      dataTraining: { images: [], labels: [] },
      page: 0,
      rowsPerPage: 25
    };
    const socket = openSocket("http://localhost:8082");
    socket.on('sequentialTrain', (trainStatus) => {
      this.setState({ sequentialTrainStatus: trainStatus });
      if (!trainStatus.running) this.timer = setInterval(this.loadModel, 1000);
    });
    this.loadExamples();
  }

  componentDidUpdate() {
    const { images } = this.getDataTrainingCurrenPage();
    images.forEach((image, index) => {
      this.drawImage(image, `canvas${index}`);
    })
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getPredict(image) {
    let imageArray = [];
    for (let i = 0; i < (IMAGE_HEIGHT * IMAGE_WIDTH); ++i) {
      imageArray.push(image[i]);
    }
    let imagesShape = [1, IMAGE_HEIGHT, IMAGE_WIDTH, 1];
    let imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
    imagesXs.set(imageArray, 0);
    return this.trainedModel.predict(tf.tensor4d(imagesXs, imagesShape));
  }

  getDataTrainingCurrenPage() {
    const { rowsPerPage, page } = this.state;
    const { images, labels, labelsPredicted } = this.state.dataTraining;
    const [rowInit, rowEnd] = [page * rowsPerPage, page * rowsPerPage + rowsPerPage];
    return {
      images: images.slice(rowInit, rowEnd),
      labels: labels.slice(rowInit, rowEnd),
      labelsPredicted: labelsPredicted != null ? labelsPredicted.slice(rowInit, rowEnd) : null,
    }
  }

  getPredictLabel(labelsPredicted, index) {
    if ((labelsPredicted == null) || (labelsPredicted.length < index)) return -1;
    return labelsPredicted[index].label;
  }

  getPredictStatuColor(label, labelsPredicted, index) {
    if ((labelsPredicted == null) || (labelsPredicted.length < index)) return "yellow";
    return parseInt(labelsPredicted[index].label) === parseInt(label) ? "primary" : "secondary";
  }

  setDataTraining(dataTraining) {
    this.setState({ dataTraining });
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

  onSubmitAmountTraining = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const amountTraining = formData.get('amountTraining');
    this.setState({ amountTraining });
    this.loadExamples();
  };

  onSubmitDoTrain = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { amountImages } = this.state;
    const trainProps = {
      epochs: formData.get('epochs'),
      data: { amountImages },
    };
    trainingsApi.doCnnHandWrittenTrain(trainProps).then((res) => { this.setState({ sequentialTrainStatus: res }); });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { amountTraining, rowsPerPage, page } = this.state;
    const { labels, labelsPredicted } = this.getDataTrainingCurrenPage();
    const amountImages = this.state.dataTraining.labels.length;
    return (
      <div className={classNames(classes.layout)}>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={4}>
            {
              (this.state.sequentialTrainStatus.running || this.state.loadRunning)
                ? <div className={classes.progressRoot}>
                  <CircularProgress className={classes.progress} />
                </div>
                : <InputExamples
                  onSubmitAmountTraining={this.onSubmitAmountTraining}
                  onSubmitDoTrain={this.onSubmitDoTrain}
                  defaultAmountTraining={amountTraining}
                />
            }
          </Grid>
          <Grid item container direction="column" xs={12} sm={8}>
            <Grid container>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                component="div"
                count={amountImages}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                  'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page',
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </Grid>
            <Grid container spacing={8}>
              {labels.map((label, index) => (
                <Grid item key={index} sm={1} md={1} lg={1}>
                  <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {label[0]}
                      </Typography>
                      <div className={classes.cardContentMida} >
                        <Badge className={classes.marginBadge} badgeContent={this.getPredictLabel(labelsPredicted, index)} color={this.getPredictStatuColor(label[0], labelsPredicted, index)}>
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
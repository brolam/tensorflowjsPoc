import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
   snackbar: {
    margin: theme.spacing.unit,
  },
});

function SequentialTrainStatus(props) {
  const { classes, trainStatus } = props;
  const  anchorOrigin={ vertical: 'bottom', horizontal: 'left'}
  return (
    <Snackbar anchorOrigin={anchorOrigin} open={true}>
      <SnackbarContent  
        className={classes.snackbar}
        message={`Epochs: ${trainStatus.currentEpoch} / ${trainStatus.epochs} Loss Train ${Number(trainStatus.loss,2)}`}> 
      </SnackbarContent>
    </Snackbar>
    );
}

SequentialTrainStatus.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SequentialTrainStatus);
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  mainGrid: {
    marginTop: theme.spacing.unit * 3,
  },
  button: {
    margin: theme.spacing.unit,
    variant: "contained"
  }
});

function InputExamples(props) {
  const { classes, onSubmitAmountTraining, defaultAmountTraining, onSubmitDoTrain } = props
  return (
    <React.Fragment>
      <form onSubmit={onSubmitAmountTraining} >
        <Typography variant="h6" gutterBottom>
          Examples:
        </Typography>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={5}>
            <TextField required={true} name="amountTraining" label="Amount of training" fullWidth defaultValue={defaultAmountTraining} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button className={classes.button} color="primary" type="Submit" >GET</Button>
          </Grid>
        </Grid>
      </form>
      <form onSubmit={onSubmitDoTrain} >
        <Typography variant="h6" gutterBottom>
          Training:
        </Typography>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={6}>
            <TextField required={true} name="epochs" label="Amount epochs" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button className={classes.button} color="primary" type="Submit" >DO</Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
}

export default withStyles(styles)(InputExamples);
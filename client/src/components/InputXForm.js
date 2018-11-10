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

function InputXForm(props) {
    const { classes, onSubmitXY, onSubmitDoTrain } = props 
    return (
    <React.Fragment>
      <form onSubmit={onSubmitXY} >
        <Typography variant="h6" gutterBottom>
          Input X
        </Typography>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={5}>
            <TextField required={true} name="x" label="X input" fullWidth />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField required={true} name="y" label="Real Y input" fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button className={classes.button} color="primary" type="Submit" >Add</Button>
          </Grid>
        </Grid>
      </form>
      <form onSubmit={onSubmitDoTrain} >
        <Typography variant="h6" gutterBottom>
          Train
        </Typography>
        <Grid container spacing={8}>
          <Grid item xs={12} sm={6}>
            <TextField required={true} name="epochs" label="Train epochs" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button className={classes.button} color="primary" type="Submit" >Train</Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
}

export default withStyles(styles)(InputXForm);
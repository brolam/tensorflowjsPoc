import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MyLinearProgress from './MyLinearProgress'

const styles = theme => ({
  mainGrid: {
    marginTop: theme.spacing.unit * 3,
  }
});

function InputXForm(props) {
    const { classes } = props 
    return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Input X
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="x"
            name="x"
            label="X input"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button size="small" color="primary">Input X</Button>
        </Grid>
        <Grid item xs={24} sm={5}>
           <Button size="small" color="primary">Input X and Train</Button>
        </Grid>
        <Grid  className={classes.mainGrid} container xs={12} >
            <Grid item xs={12} >
                <Typography variant="h6" gutterBottom> Training Process</Typography>
            </Grid>
            <Grid item xs={12} >
              <MyLinearProgress/>
            </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default withStyles(styles)(InputXForm);
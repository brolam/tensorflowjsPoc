import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    heroUnit: {
        backgroundColor: theme.palette.background.paper,
    },
    heroContent: {
        maxWidth: 600,
        margin: '0 auto',
        padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
    },
});

function About(props) {
    const { classes } = props
    return (
        <div className={classes.heroUnit}>
          <div className={classes.heroContent}>
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
             TensorflowJS exemplos
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
              Modelos preditivos construidos desenvolvidos em TensorflowJS.
            </Typography>
          </div>
        </div>
    )
}

export default withStyles(styles)(About)
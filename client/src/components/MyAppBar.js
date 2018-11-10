import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    icon: {
        marginRight: theme.spacing.unit * 2,
    },
});

function MyAppBar(props) {
    const { classes, routes } = props
    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
                <CameraIcon className={classes.icon} onClick={() => routes.setPage(routes.PagesRoutes.APP)} />
                <Typography variant="h6" color="inherit" noWrap>
                    TensorflowJS POC
          </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default withStyles(styles)(MyAppBar)
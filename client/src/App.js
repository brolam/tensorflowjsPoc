import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MyAppBar from './components/MyAppBar'
import About from './components/About'
import ModelsList from './components/ModelsList'
import MyFooter from './components/MyFooter'
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import routes from './routes'
import LinearRegressionPage from './pages/LinearRegressionPage'

const styles = theme => ({
  
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { currentPage: routes.PagesRoutes.APP };
    routes.setApp(this)
  }
  render() {
    return (
    <React.Fragment>
      <CssBaseline />
      <MyAppBar routes={routes} />
      <main>
        <About/>
        {(this.state.currentPage === routes.PagesRoutes.LINEAR_REGRESSION) && <LinearRegressionPage/>}
        {(this.state.currentPage === routes.PagesRoutes.APP) && <ModelsList routes={routes}/>}
      </main>
      <MyFooter/>
    </React.Fragment>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
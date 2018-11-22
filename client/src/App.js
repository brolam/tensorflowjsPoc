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
import PolynomialRegressionPage from './pages/PolynomialRegressionPage'
import CnnHandWrittenPage from './pages/CnnHandWrittenPage'

const styles = theme => ({

});

const cards = [
  { title: "Regressão Linear", description: "Exemplo de treinamento linear.", page: routes.PagesRoutes.LINEAR_REGRESSION },
  { title: "Regressão Polynomial", description: "Exemplo de treinamento polynomial", page: routes.PagesRoutes.POLYNOMIAL_REGRESSION },
  { title: "Convolutional Neural Network", description: "Exemplo de treinamento para reconhecer letras escritas a mão.", page: routes.PagesRoutes.CNN_HAND_WRITTEN },
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: routes.PagesRoutes.APP,
    };
    routes.setApp(this);
  }

  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <MyAppBar routes={routes}  />
        <main>
          <About />
          {(this.state.currentPage === routes.PagesRoutes.LINEAR_REGRESSION) && <LinearRegressionPage app={this} />}
          {(this.state.currentPage === routes.PagesRoutes.POLYNOMIAL_REGRESSION) && <PolynomialRegressionPage app={this} />}
          {(this.state.currentPage === routes.PagesRoutes.CNN_HAND_WRITTEN) && <CnnHandWrittenPage app={this} />}
          {(this.state.currentPage === routes.PagesRoutes.APP) && <ModelsList routes={routes} cards={cards} />}
        </main>
        <MyFooter />
      </React.Fragment>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
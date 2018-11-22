var Routes = {
    PagesRoutes: {
        APP: 'APP',
        LINEAR_REGRESSION: 'LINEAR_REGRESSION',
        POLYNOMIAL_REGRESSION: 'POLYNOMIAL_REGRESSION',
        CNN_HAND_WRITTEN: 'CNN_HAND_WRITTEN'
    }
}

Routes.app = {}
Routes.setPage = function (page){
    this.app.setState({currentPage: page })
}
    
Routes.setApp = function(app) {
    this.app = app
}

export default Routes
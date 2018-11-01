import React from 'react';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const cards = [1];

const data = [
  { houseWeigth: 1, housePrice: 1},
  { houseWeigth: 2, housePrice: 2},
  { houseWeigth: 3, housePrice: 3},
  { houseWeigth: 4, housePrice: 4},
  { houseWeigth: 5, housePrice: 5},
  { houseWeigth: 6, housePrice: 6},
  { houseWeigth: 7, housePrice: 7},
];

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
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    //paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  }
});



function ModelsList(props){
    const {classes, routes} = props
    return(
    <div className={classNames(classes.layout, classes.cardGrid)}>
        <Grid container spacing={40}>
            {cards.map(card => (
              <Grid item key={card} sm={6} md={4} lg={3}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      Regressão linear
                    </Typography>
                    <Typography>
                      Exemplo linear da relação do preço vs. m².
                    </Typography>
                  </CardContent>
                  <CardMedia className={classes.cardMedia}>
                  <LineChart width={200} height={200} data={data} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                  <XAxis dataKey="houseWeigth"/>
                  <YAxis dataKey="housePrice" />
                  <CartesianGrid stroke="#ccc" />
                  <Tooltip/>
                  <Legend />
                  <Line type="monotone" dataKey="housePrice" stroke="#82ca9d" />
                  </LineChart>
                  </CardMedia>
                  <CardActions>
                    <Button size="small" color="primary" onClick={ ()=> routes.setPage(routes.PagesRoutes.LINEAR_REGRESSION) }>
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
    </div>
    )
}

export default withStyles(styles)(ModelsList)
const apiUrl = "http://localhost:8082/api/"

let trainingsApi = {};

const fetchOption = (method, bodyParam = null) => ({
  method,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: bodyParam != null ? JSON.stringify(bodyParam) : null
})

const fetch = window.fetch
trainingsApi.doSequentialTrain = (trainProps) =>
  fetch(`${apiUrl}doSequentialTrain`, fetchOption('POST', trainProps)).then(response => response.json()).then(jsondata => jsondata)

export default trainingsApi

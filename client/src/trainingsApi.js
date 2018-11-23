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

trainingsApi.getPolynomialTrainExamples = () => fetch(
  `${apiUrl}getPolynomialTrainExamples`, fetchOption('GET')
).then(response => response.json()
).then(jsondata => jsondata)

trainingsApi.doPolynomialTrain = (trainProps) =>
  fetch(`${apiUrl}doPolynomialTrain`, fetchOption('POST', trainProps)).then(response => response.json()).then(jsondata => jsondata)

trainingsApi.getCnnHandWrittenTrainExamples = (amount) =>
  fetch(`${apiUrl}getCnnHandWrittenTrainExamples/${amount}`, fetchOption('GET')).then(response => response.json()).then(jsondata => jsondata)

trainingsApi.doCnnHandWrittenTrain = (trainProps) =>
  fetch(`${apiUrl}doCnnHandWrittenTrain`, fetchOption('POST', trainProps)).then(response => response.json()).then(jsondata => jsondata)

trainingsApi.getCnnHandWrittenTrainLabel = (image) =>
  fetch(`${apiUrl}getCnnHandWrittenTrainLabel`, fetchOption('POST', image)).then(response => response.json()).then(jsondata => jsondata)

export default trainingsApi

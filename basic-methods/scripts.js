var possibleDecisions = [];
var negativeOutcome = [];
var positiveOutcome = [];

//--MainFunction------------------------------------------------------------
function evaluateBasicDecisionMethods() {
  const fileReader = prepearFileReader();

  fileReader.onload = () => {
    const data = fileReader.result;
    let list = readData(data);

    possibleDecisions = [...list[0]];
    possibleDecisions.splice(0, 1);
    negativeOutcome = myParse(list[1]);
    positiveOutcome = myParse(list[2]);

    printResults(pesimist(), optimist(), laplace(), savage());

    drawHurwiczChart(hurwicz());
  };
}

//--ReadingFile--------------------------------------------------------------
function prepearFileReader() {
  let fileReader = new FileReader();
  let input = document.getElementById("myFile");
  const csvFile = input.files[0];
  fileReader.readAsText(csvFile);

  return fileReader;
}

function readData(data) {
  let list = [];
  let lines = data.split("\n");
  while (typeof lines[0] !== "undefined") {
    let line = lines.shift();
    let split = line.split(",");
    list.push(split);
  }
  return list;
}

function myParse(arr) {
  let numbers = [];
  for (let i = 0; i < arr.length; i++) {
    if (!isNaN(arr[i])) {
      number = parseInt(arr[i]);
      numbers.push(number);
    }
  }
  return numbers;
}

//--DecisionMethods----------------------------------------------------------
function pesimist() {
  let pesimistResult;

  pesimistResult = getResult(negativeOutcome, "max");

  return pesimistResult;
}

function optimist() {
  let optimistResult;

  optimistResult = getResult(positiveOutcome, "max");

  return optimistResult;
}

function laplace() {
  let laplaceResult;

  let averages = [];
  for (let i = 0; i < possibleDecisions.length; i++) {
    averages.push((negativeOutcome[i] + positiveOutcome[i]) / 2);
  }

  laplaceResult = getResult(averages, "max");

  return laplaceResult;
}

function savage() {
  let savageResult;

  let bestPositiveOutcome = Math.max(...positiveOutcome);
  let bestNegativeOutcome = Math.max(...negativeOutcome);
  let arrPositive = [];
  let arrNegative = [];
  let arrFinal = [];

  for (let i = 0; i < possibleDecisions.length; i++) {
    arrPositive.push(bestPositiveOutcome - positiveOutcome[i]);
    arrNegative.push(bestNegativeOutcome - negativeOutcome[i]);
  }

  for (let i = 0; i < possibleDecisions.length; i++) {
    arrFinal.push(Math.max(arrPositive[i], arrNegative[i]));
  }

  savageResult = getResult(arrFinal, "min");

  return savageResult;
}

function hurwicz() {
  let hurwiczResult = [];

  for (let i = 0; i < possibleDecisions.length; i++) {
    let hurwiczCalculations = [];

    for (let j = 0; j <= 10; j++) {
      let positiveFactor = j / 10;
      let negativeFactor = 1 - j / 10;

      let hurwiczCalculation =
        positiveFactor * positiveOutcome[i] +
        negativeFactor * negativeOutcome[i];

      hurwiczCalculations.push(hurwiczCalculation);
    }

    hurwiczResult.push(hurwiczCalculations);
  }

  return hurwiczResult;
}

//--Help Method to remove reccuring code-------------------------------------
function getResult(arr, minOrMax) {
  let numericResult;
  if (minOrMax === "min") {
    numericResult = Math.min(...arr);
  } else {
    numericResult = Math.max(...arr);
  }
  let indexOfResult = arr.indexOf(numericResult);
  let result = possibleDecisions[indexOfResult] + " (" + numericResult + ")";

  return result;
}

//--PrintResults-------------------------------------------------------------
function printResults(
  pesimistResult,
  optimistResult,
  laplaceResult,
  savageResult
) {
  document.getElementById("resultDiv").className = "row";

  document.getElementById("pesimist").innerHTML =
    "<p><b>PESIMIST: </b>" + pesimistResult + "</p>";
  document.getElementById("optimist").innerHTML =
    "<p><b>OPTIMIST: </b>" + optimistResult + "</p>";
  document.getElementById("laplace").innerHTML =
    "<p><b>LAPLACE: </b>" + laplaceResult + "</p>";
  document.getElementById("savage").innerHTML =
    "<p><b>SAVAGE: </b>" + savageResult + "</p>";
}

function drawHurwiczChart(hurwiczResult) {
  var ctx = document.getElementById("hurwiczChart").getContext("2d");
  let myDatasets = [];
  for (let i = 0; i < possibleDecisions.length; i++) {
    let rgb = getRandomRgb();
    let dataset = {
      label: possibleDecisions[i],
      backgroundColor: rgb,
      borderColor: rgb,
      data: hurwiczResult[i],
    };
    myDatasets.push(dataset);
  }
  let myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "0",
        "0.1",
        "0.2",
        "0.3",
        "0.4",
        "0.5",
        "0.6",
        "0.7",
        "0.8",
        "0.9",
        "1",
      ],

      datasets: myDatasets,
    },
  });
}

function getRandomRgb() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = (num >> 8) & 255;
  var b = num & 255;
  return "rgb(" + r + ", " + g + ", " + b + ")";
}

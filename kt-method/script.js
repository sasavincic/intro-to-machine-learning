let parameters = [null];
let parameterWeights = [null];
let atributes = [null];
let atributeValues = [];
let results = [];

function main() {
  readInput();
  kepnerTregoe(atributeValues);
  printResults();
  drawGraphs();
  prepareButtonsForThirdGraph();
}

//--CALCULATION----------------------------------------------------------------------------------------------------------------------------
function kepnerTregoe(currentAtributeValues) {
  for (let i = 0; i < atributes.length; i++) {
    let result = 0;
    for (let j = 0; j < parameters.length; j++) {
      let tmp = currentAtributeValues[j][i] * parameterWeights[j];
      result += tmp;
    }
    results.push(result);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//--PROCESS INPUT----------------------------------------------------------------------------------------------------------------------------
function readInput() {
  document.getElementById("calculateButton").innerHTML = "";

  for (let i = 0; i < parameters.length; i++) {
    parameters[i] = document.getElementById(`parameter${i + 1}`).value;
    parameterWeights[i] = document.getElementById(`parameter${i + 1}weight`).value;
    let tmpArray = [];
    for (let j = 0; j < atributes.length; j++) {
      tmpArray.push(document.getElementById(`atribute${j + 1}row${i + 1}`).value);
    }
    atributeValues[i] = tmpArray;
  }

  for (let i = 0; i < atributes.length; i++) {
    atributes[i] = document.getElementById(`atributeName${i + 1}`).value;
  }
}

//--PRINT RESULTS----------------------------------------------------------------------------------------------------------------------------
function printResults() {
  let myTableFoot = document.getElementById("myTableFoot");

  let resultsHeading = document.createElement("th");
  resultsHeading.innerHTML = "Results:";

  myTableFoot.appendChild(resultsHeading);
  myTableFoot.appendChild(document.createElement("td"));
  myTableFoot.appendChild(document.createElement("td"));

  let bestResult = Math.max(...results);

  results.forEach((result) => {
    let resultCell = document.createElement("td");
    resultCell.innerHTML = result;
    myTableFoot.appendChild(resultCell);

    if (result === bestResult) {
      resultCell.style.backgroundColor = "rgba(46, 204, 113, 1)";
    }
  });
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//--DRAW GRAPHS----------------------------------------------------------------------------------------------------------------------------

function getRandomRgba() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = (num >> 8) & 255;
  var b = num & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + 0.4 + ")";
}

function drawGraphs() {
  const firstCtx = document.getElementById("firstChart").getContext("2d");
  const firstChart = new Chart(firstCtx, {
    type: "bar",
    data: {
      labels: atributes,
      datasets: [
        {
          label: "Results",
          data: results,
          backgroundColor: getRandomRgba(),
        },
      ],
    },
  });

  const secondCtx = document.getElementById("secondChart").getContext("2d");
  const secondChart = new Chart(secondCtx, {
    type: "doughnut",
    data: {
      labels: parameters,
      datasets: [
        {
          label: "Parameter Weights",
          data: parameterWeights,
          backgroundColor: getRandomRgba(),
        },
      ],
    },
  });
}

function prepareButtonsForThirdGraph() {
  let mainDiv = document.getElementById("extraChart");
  mainDiv.innerHTML = "";

  parameters.forEach((parameter) => {
    let parameterIndex = parameters.indexOf(parameter);
    mainDiv.innerHTML += `<Button class='btn btn-secondary mb-2' onclick='drawExtraGraph(${parameterIndex})'>${parameter}</Button><br />`;
  });
}

function drawExtraGraph(parameterIndex) {
  let mainDiv = document.getElementById("extraChart");

  mainDiv.innerHTML = `<button class='btn btn-secondary' onclick='prepareButtonsForThirdGraph()' >Back</button> <h3>${parameters[parameterIndex]}</h3><canvas id='thirdChart' width='80%' height='60%'></canvas>`;

  let allWeights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let myDatasets = [];
  let paramSensitivity = [];

  for (let i = 0; i < atributes.length; i++) {
    let tmpArr = [];
    let baseResult = results[i] - parameterWeights[parameterIndex] * atributeValues[parameterIndex][i];
    for (let j = 0; j < allWeights.length; j++) {
      let tmp = allWeights[j] * atributeValues[parameterIndex][i] + baseResult;
      tmpArr.push(tmp);
    }
    paramSensitivity.push(tmpArr);
    let dataset = {
      label: atributes[i],
      backgroundColor: getRandomRgba(),
      data: paramSensitivity[i],
    };
    myDatasets.push(dataset);
  }

  console.log(paramSensitivity);

  const ctx = document.getElementById("thirdChart").getContext("2d");
  const thirdChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: allWeights,
      datasets: myDatasets,
    },
  });
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//--ADD PARAMETER TO TABLE----------------------------------------------------------------------------------------------------------------------------
function addParameter() {
  let tableBody = document.getElementById("myTableBody");

  parameters.push(null);
  parameterWeights.push(null);
  let nextParameterNum = parameters.length;

  let row = document.createElement("tr");
  row.setAttribute("id", `myTableBodyRow${nextParameterNum}`);
  tableBody.appendChild(row);

  let newParameter = document.createElement("th");
  newParameter.innerHTML = `${nextParameterNum}`;
  row.appendChild(newParameter);

  let inputParameterText = document.createElement("td");
  inputParameterText.innerHTML = `<input type="text" id="parameter${nextParameterNum}" />`;
  let inputParameterWeight = document.createElement("td");
  inputParameterWeight.innerHTML = `<input type="number" id="parameter${nextParameterNum}weight" />`;
  row.appendChild(inputParameterText);
  row.appendChild(inputParameterWeight);

  for (let i = 0; i < atributes.length; i++) {
    let inputAtribute = document.createElement("td");
    inputAtribute.innerHTML = `<input type="number" id="atribute${i + 1}row${nextParameterNum}" />`;
    row.appendChild(inputAtribute);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//--ADD ATRIBUTE TO TABLE----------------------------------------------------------------------------------------------------------------------------
function addAtribute() {
  let tableHead = document.getElementById("myTableHead");

  atributes.push(null);
  atributeValues.push(null);
  let nextAtributeNum = atributes.length;

  let heading = document.createElement("th");
  heading.innerHTML = `<input type="text" id="atributeName${nextAtributeNum}" value="Atriubte name" />`;
  tableHead.appendChild(heading);

  for (let i = 0; i < parameters.length; i++) {
    let currentRow = document.getElementById(`myTableBodyRow${i + 1}`);
    let input = document.createElement("td");
    input.innerHTML = `<input type="number" id="atribute${nextAtributeNum}row${i + 1}" />`;
    currentRow.appendChild(input);
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//--RESET TABLE----------------------------------------------------------------------------------------------------------------------------
function resetTable() {
  document.getElementById("myForm").reset();
  window.location.reload();
}
//------------------------------------------------------------------------------------------------------------------------------------------

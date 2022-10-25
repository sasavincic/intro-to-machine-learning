let nodes = new Map();
idCounter = 1;
alternativeCounter = 1;
let attributes = [];
let tableData = [];
let alternativeResults = new Map();
var chart;
let chartImage;

let horizontalButton = `<ul><li><span class="tf-nc addButton" onclick="addAttribute(this)"><span class="nodeContentButton">Dodaj atribut</span></span></li></ul>`;
let verticalButton = `<li><span class="tf-nc addButton" onclick="addAttribute(this)"><span class="nodeContentButton">Dodaj atribut</span></span></li>`;
let leafContent = `
<span class="nodeContent">
<input class="form-control attribute" type="text" placeholder="Atribut" onChange="saveNodeValue(this)" />
<input class="form-control weight" type="number" placeholder="Teža" step="0.1" onChange="saveNodeValue(this)" />
<input class="form-control best" type="number" placeholder="Najugodnejša vrednost" step="0.1" onChange="saveNodeValue(this)" />
<input class="form-control worst" type="number" placeholder="Najmanj ugodna vrednost" step="0.1" onChange="saveNodeValue(this)" />
<select class="form-control utilityFunction" onChange="saveNodeValue(this)">
  <option value="linearna">Linearna funkcija</option>
  <option value="log-narascajoca">Logaritemska funkcija - naraščajoča</option>
  <option value="log-padajoca">Logaritemska funkcija - padajoča</option>
</select>
<i class="fas fa-times" onclick="removeNode(this)"></i>
</span>`;

//TREE
function addAttribute(element) {
  let parentNodeId = $(element).parent().parent().parent().attr("id");
  if (nodes.has(parentNodeId) && nodes.get(parentNodeId).isValid()) {
    $(element).attr("class", "tf-nc");
    $(element).attr("onclick", "");
    $(element).html(leafContent);
    $(element).parent().attr("id", idCounter);
    $(element).parent().append(horizontalButton);
    $(element).parent().parent().append(verticalButton);
    idCounter++;
  } else {
    alert("Neustrezno izpolnjeno!");
  }
}

function removeNode(element) {
  let parent = $(element).parent().parent().parent();
  nodes.delete(parent.attr("id"));
  parent.html("");
}

//TABLE
function drawTable() {
  $("#drawTableButton").attr("class", "btn btn-danger").attr("onclick", "deleteTable()").html("Izbriši tabelo");
  $("#tableHead").html("");
  $("#tableBody").html("");
  attributes = [];
  alternativeResults = new Map();

  nodes.forEach((node) => {
    if (node.children.length == 0) {
      attributes.push(node.attribute);
    }
  });

  if (attributes.length < 1) {
    alert("Vnesite nekaj atributov!");
  } else {
    //Glava tabele
    $("#tableHead").append("<th>Alternativa</th>");
    attributes.forEach((attribute) => {
      $("#tableHead").append(`<th>${attribute}</th>`);
    });
    $("#tableHead").append("<th>Rezultat</th>");

    //Telo tabele
    for (let i = 1; i <= alternativeCounter; i++) {
      if (i != 1) $("#tableBody").append("<tr>");
      $("#tableBody").append(`<td><input class='form-control' id='${i}-name' type=text placeholder='Ime alternative' /></td>`);
      attributes.forEach((attribute) => {
        $("#tableBody").append(`<td><input class='form-control' id='${i}-${attribute}' placeholder='Vnesi vrednost' onchange="readTable()" type=number /></td>`);
      });
      $("#tableBody").append(`<td class='result' id='${i}-result'>0</td>`);
      if (i != 1) $("#tableBody").append("</tr>");
    }

    $("#addAlternativeButton").attr("class", "btn btn-secondary");
    $("#calculateButton").attr("class", "btn btn-success");
  }
}

function deleteTable() {
  $("#tableHead").html("");
  $("#tableBody").html("");
  $("#drawTableButton").attr("class", "btn btn-secondary").attr("onclick", "drawTable()").html("Izriši tabelo");
  $("#addAlternativeButton").attr("class", "d-none");
  $("#calculateButton").attr("class", "d-none");
  $("#bestAlternatives").html("");
  wipeCanvas();

  alternativeCounter = 1;
}

function addAlternative() {
  alternativeCounter++;
  drawTable();
}

//LOGIC
function Node(element) {
  this.id = $(element).parent().attr("id");
  this.attribute = $(element).children(".nodeContent").children(".attribute").val();
  this.weight = $(element).children(".nodeContent").children(".weight").val();
  this.best = $(element).children(".nodeContent").children(".best").val();
  this.worst = $(element).children(".nodeContent").children(".worst").val();
  this.utilityFunction = $(element).children(".nodeContent").children(".utilityFunction").val();
  this.children = [];
  this.utility;
  this.alternative;

  if ($(element).parent().attr("id") == "root") {
    this.weight = "1";
  }

  this.isValid = () => {
    if (this.attribute != "" && this.weight != "") {
      return true;
    }
    return false;
  };
}

function saveNodeValue(input) {
  let element = $(input).parent().parent();
  let children = [];
  if (nodes.has($(element).parent().attr("id"))) {
    children = nodes.get($(element).parent().attr("id")).children;
  }
  let node = new Node(element);
  node.children = children;
  nodes.set(node.id, node);
  if (node.id !== "root") {
    let parentId = $(element).parent().parent().parent().attr("id");
    let parentNode = nodes.get(parentId);
    let siblings = [];
    let existingChild = false;
    parentNode.children.forEach((child) => {
      if (child.id === node.id) {
        siblings.push(node);
        existingChild = true;
      } else {
        siblings.push(child);
      }
    });
    if (!existingChild) {
      siblings.push(node);
    }
    parentNode.children = siblings;
    nodes.set(parentId, parentNode);
  }
}

function readTable() {
  tableData = [];
  for (let i = 1; i <= alternativeCounter; i++) {
    let alternatives = new Map();
    alternatives.set("alternativeName", $(`#${i}-name`).val());
    attributes.forEach((attribute) => {
      let valueForAtribute = $(`#${i}-${attribute}`).val();
      alternatives.set(attribute, valueForAtribute);
    });
    tableData.push(alternatives);
  }
}

function returnResult() {
  for (let i = 0; i < tableData.length; i++) {
    let result = calculate(nodes.get("root"), i);
    alternativeResults.set(tableData[i].get("alternativeName"), result);
    $(`#${i + 1}-result`).html(result);
    $("#compareAlternativesButton").attr("class", "btn btn-info");
  }
  let bestResult = Math.max(...alternativeResults.values());
  let bestAlternatives = [];

  for (const [key, value] of alternativeResults.entries()) {
    if (value == bestResult) {
      bestAlternatives.push(key);
    }
  }
  $("#bestAlternatives").html("Najboljša alternativa: ");
  $("#bestAlternatives").attr("class", "");
  for (let i = 0; i < bestAlternatives.length; i++) {
    $("#bestAlternatives").append(bestAlternatives[i]);
    if (i !== bestAlternatives.length - 1) {
      $("#bestAlternatives").append(", ");
    }
  }
}

function calculate(node, alternativeIndex) {
  if (node.children.length > 0) {
    let result = 0;
    node.children.forEach((child) => {
      result += calculate(child, alternativeIndex) * parseFloat(node.weight);
    });
    return result;
  } else {
    let result;
    let x = parseFloat(tableData[alternativeIndex].get(node.attribute));
    let best = parseFloat(node.best);
    let worst = parseFloat(node.worst);
    let weight = parseFloat(node.weight);
    switch (node.utilityFunction) {
      case "linearna": {
        let k = 1 / (best - worst);
        let n = 1 - k * best;
        result = k * x + n;
        return result * weight;
      }
      case "log-narascajoca": {
        let z = worst - 1;
        result = Math.log10(x - z) * (1 / Math.log10(best - z));
        return result * weight;
      }
      case "log-padajoca": {
        let z = best - 1;
        result = -(Math.log10(x - z) * (1 / Math.log10(worst - z))) + 1;
        return result * weight;
      }
    }
  }
}

//Draw Graph
function getRandomRgba() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = (num >> 8) & 255;
  var b = num & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + 0.4 + ")";
}

function wipeCanvas() {
  $("#compareAlternativesParent").html("");
  $("#exportGraphButton").attr("class", "d-none");
  $("#compareAlternativesButton").attr("class", "d-none");
}
function prepareCanvas() {
  $("#compareAlternativesParent").append("<canvas id='compareAlternativesChart' width='50' height='50'></canvas>");
  $("#exportGraphButton").attr("class", "btn btn-secondary");
  $("#compareAlternativesButton").attr("class", "btn btn-info");
}

function prepareGraph() {
  chart = new Chart(document.getElementById("compareAlternativesChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: Array.from(alternativeResults.keys()),
      datasets: [
        {
          label: "Results",
          data: Array.from(alternativeResults.values()),
          backgroundColor: getRandomRgba(),
        },
      ],
    },
  });
}

function drawGraph() {
  wipeCanvas();
  prepareCanvas();
  prepareGraph();
}

function exportGraph() {
  let a = document.createElement("a");
  a.href = chart.toBase64Image();
  a.download = "grafPrimerjaveAlternativ.png";
  a.click();
}

const currentVersion = "22:19";
const maxResults = 10;

let previousResult = '';
let previousFormula = '';
let arrRes = [];
let arrIndex = 0;

// For debugging
window.addEventListener("load", () => {
  const storedVersion = localStorage.getItem("appVersion");

  if (storedVersion === null || storedVersion !== currentVersion) {
    alert(`New JS file of "${currentVersion}" is loaded!`);
    localStorage.setItem("appVersion", currentVersion);
  }
});

document.getElementById("formula-field").addEventListener("keydown", function (event) {
  if (event.keyCode === 32 || event.key === "Space" || event.key === " ") {

      const value = document.getElementById("formula-field").value;
      if (previousResult !== '' && typeof value === "string" && value.trim() === "") {
          event.preventDefault();
          document.getElementById("formula-field").value = previousResult;
      }
  }
  else if (event.key === "Enter") 
  {
    event.preventDefault();
    readFormulaField();
  }
  else if (event.key === "Tab")
  {
    event.preventDefault();
    const value = document.getElementById("formula-field").value;
    if(previousFormula !== '' && typeof value == "string" && value.trim() === "")
    {
      document.getElementById("formula-field").value = previousFormula;
    }
  }
});


// When a calculation form is submitted
document.getElementById("submit").addEventListener("click", function () {
  readFormulaField();
});

// When results' elements are clicked
document.getElementById("results-area").addEventListener("click", function (event) {
  if (event.target && event.target.classname === "result-item") {
    
    const positionalIndex = Array.from(document.getElementById("results-area").children).indexOf(event.target);

    const index = (arrIndex - positionalIndex + maxResults) % maxResults;
    
    const formula = arrRes[index];

    navigator.clipboard.writeText(formula).then(() => {
      alert(`"${formula}" をクリップボードにコピーしました`);
    }).catch(err => {
      console.error("コピー失敗:", err);
    });
  }
});

// When a tweet button is clicked
document.getElementById("reportBtn").addEventListener("click", function () {
  const text = encodeURIComponent("#2025電卓　(開発者はこのタグを不定期に検索することでデバッグに取り掛かります！)");
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, "_blank");
});

// Parse equations and return the value (and action status)
function parseAndEvaluate(expr) {
  if (!/^[0-9+\-*/. ]+$/.test(expr))  return { success: false };

  try {
    let result = eval(expr);
    return { success: true, value: result };
  } catch (e) {
    return { success: false };
  }
}

const ParseStatus = Object.freeze({
  SUCCESS: "success",
  INVALID_TYPE: "invalid_type",
  INVALID_SPACE: "invalid_space",
  UNMATCHED_SYMBOL: "unmatched_symbol",
  EMPTY_STRING: "empty_string",
  INVALID_CHAR: "invalid_char"
});

// helper method
function IsNumber(char) {
  return parseInt(char, 10) == char;
}

function IsOpSymbol(char) {
  const operators = ["+", "-", "*", "_", "^", "%"];
  return operators.includes(char);
}

// Get a string representing a timestamp (self-explanatory tho)
function getCurrentTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Apply a player input
function readFormulaField() {
  const formulaRaw = document.getElementById("formula-field").value;
  
  if (typeof formulaRaw !== "string") 
  {
    alert("The given value is not a string: " + value);
    return;
  }

  previousFormula = formulaRaw;
  document.getElementById("formula-field").value = "";

  const solution = parseAndEvaluate(formulaRaw);
  if (!solution.success)
  {
    alert("The given value contains invalid words: " + formulaRaw);
    return;
  }
  const resultsArea = document.getElementById("results-area");
  previousResult = solution.value;

  const newResult = document.createElement("div");
  const timestamp = getCurrentTimestamp();
  newResult.textContent = `📌${formulaRaw} = ${solution.value} (${timestamp})`;
  newResult.className = "result-item";

  if (resultsArea.children.length >= maxResults) 
  {
    resultsArea.removeChild(resultsArea.lastChild);
  }

  const formulaToBeCopied = `${formulaRaw} = ${solution.value}`;

  resultsArea.prepend(newResult);
  arrIndex = (arrIndex + maxResults + 1) % maxResults;
  arrRes[arrIndex] = formulaToBeCopied;
}

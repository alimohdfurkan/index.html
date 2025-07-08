// --- Dynamic Y Names & Inputs (Name then Values) ---
function updateYInputs() {
  let nY = +document.getElementById('numYs').value;
  let yInputs = document.getElementById('yInputs');
  yInputs.innerHTML = '';
  for (let i = 0; i < nY; i++) {
    yInputs.innerHTML +=
      `<div class="mb-2">
        <label class="form-label">Dependent Variable ${i+1} Name</label>
        <input type="text" class="form-control mb-1" id="yName${i}" value="Y${i+1}" placeholder="Y${i+1} Name">
        <label class="form-label">${'Y'+(i+1)} Values (comma separated)</label>
        <textarea class="form-control mb-1" id="yVals${i}" rows="1" placeholder="e.g. 3,7,10"></textarea>
      </div>`;
  }
}
document.getElementById('numYs').addEventListener('change', updateYInputs);
updateYInputs(); // Show on first load!

function linearRegression(x, y) {
  let n = x.length;
  let xbar = x.reduce((a, b) => a + b, 0) / n;
  let ybar = y.reduce((a, b) => a + b, 0) / n;
  let num = x.reduce((acc, xi, i) => acc + (xi - xbar) * (y[i] - ybar), 0);
  let den = x.reduce((acc, xi) => acc + (xi - xbar) ** 2, 0);
  let b = num / den;
  let a = ybar - b * xbar;
  let yhat = x.map(xi => a + b * xi);
  let ssTot = y.reduce((acc, yi) => acc + (yi - ybar) ** 2, 0);
  let ssRes = y.reduce((acc, yi, i) => acc + (yi - yhat[i]) ** 2, 0);
  let r2 = 1 - ssRes / ssTot;
  return { a, b, yhat, r2 };
}

function runRegression() {
  document.getElementById('results').style.display = 'none';
  document.getElementById('plotlyDiv').innerHTML = '';
  document.getElementById('outputText').innerHTML = '';
  document.getElementById('predTable').innerHTML = '';
  document.getElementById('downloadPlot').style.display = 'none';

  let xName = document.getElementById('xName').value.trim() || 'X';
  let x = document.getElementById('xVals').value.split(',').map(s => +s.trim()).filter(s => s !== "");
  let nY = +document.getElementById('numYs').value;
  let yNames = [], yVals = [];
  for (let i = 0; i < nY; i++) {
    yNames.push(document.getElementById(`yName${i}`).value.trim() || `Y${i+1}`);
    let y = document.getElementById(`yVals${i}`).value.split(',').map(s => +s.trim()).filter(s => s !== "");
    yVals.push(y);
  }
  let n = x.length;
  for (let i = 0; i < nY; i++) {
    if (yVals[i].length !== n) {
      alert(`Row count for ${yNames[i]} does not match X.`);
      return;
    }
  }

  // Regression per Y
  let equations = [];
  let results = [];
  let traces = [];
  let predRows = [];
  let colorPalette = ['#0072B2', '#D55E00', '#009E73', '#F0E442', '#56B4E9', '#CC79A7', '#E69F00'];
  for (let i = 0; i < nY; i++) {
    let { a, b, yhat, r2 } = linearRegression(x, yVals[i]);
    equations.push(`<b>${yNames[i]}</b>: <span style="color:#1748aa;">${yNames[i]} = ${a.toFixed(4)} + ${b.toFixed(4)}·${xName}</span>`);
    results.push(`${yNames[i]}: R² = ${r2.toFixed(4)}, a = ${a.toFixed(4)}, b = ${b.toFixed(4)}`);
    traces.push({
      x: x, y: yVals[i], mode: 'markers', name: `${yNames[i]} (Actual)`,
      marker: { size: 8, color: colorPalette[i % colorPalette.length] },
      legendgroup: `grp${i}`
    });
    traces.push({
      x: x, y: yhat, mode: 'lines', name: `${yNames[i]} (Fit)`,
      line: { dash: 'dash', width: 3, color: colorPalette[i % colorPalette.length] },
      legendgroup: `grp${i}`, showlegend: true
    });
    if (predRows.length === 0) predRows = x.map((xi, idx) => [xi]);
    for (let idx = 0; idx < n; idx++) {
      if (!predRows[idx][1]) predRows[idx][1] = [];
      predRows[idx].push(yVals[i][idx], yhat[idx]);
    }
  }

  // Output
  document.getElementById('results').style.display = '';
  document.getElementById('outputText').innerHTML =
    `<h5>Regression Equations</h5><ul>${equations.map(e => `<li>${e}</li>`).join('')}</ul>
    <b>Coefficients & R²:</b><br>${results.join('<br>')}`;
  // Table output
  let table = `<table class="result-table"><tr><th>#</th><th>${xName}</th>`;
  for (let i = 0; i < nY; i++) {
    table += `<th>${yNames[i]}</th><th>${yNames[i]} (Pred)</th>`;
  }
  table += '</tr>';
  for (let i = 0; i < n; i++) {
    table += `<tr><td>${i+1}</td><td>${x[i]}</td>`;
    for (let j = 0; j < nY; j++) {
      table += `<td>${yVals[j][i]}</td><td>${linearRegression(x, yVals[j]).yhat[i].toFixed(3)}</td>`;
    }
    table += '</tr>';
  }
  table += '</table>';
  document.getElementById('predTable').innerHTML = table;

  // Plot with legend in top-left and pairs arranged vertically
  Plotly.newPlot('plotlyDiv', traces, {
    xaxis: { title: xName },
    yaxis: { title: yNames.join(', ') },
    margin: { t: 38 },
    title: "Regression Fits",
    legend: { orientation: 'v', x: 0, y: 1.13, xanchor: 'left', yanchor: 'top', font: {size: 13} }
  }, { responsive: true });
  document.getElementById('downloadPlot').style.display = 'block';
}
function resetAll() {
  document.getElementById('xName').value = 'X';
  document.getElementById('xVals').value = '';
  document.getElementById('numYs').value = 2;
  updateYInputs();
  document.getElementById('results').style.display = 'none';
}
function downloadPlot() {
  Plotly.downloadImage('plotlyDiv', {
    format: 'png',
    width: 900,
    height: 500,
    filename: 'regression_plot'
  });
}

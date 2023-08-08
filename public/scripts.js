var aerolineaTiempos = {
  '342': [0, 2, 3], // Y4
  '6653': [0, 2, 3], // iberia
  '340': [0, 2, 3], // Y4
  '3544': [0, 4, 3], // conviasa
  '4110': [0, 2, 3], // Q6
  '6659': [0, 2, 3], // Iberia
  '748': [0, 2, 3], // boa
  '1825': [0, 2, 3], // jetblue
};

var currentRow = {};

function formatDate(dateString) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const date = new Date(dateString);
  if (isNaN(date)) {
    return '';
  }
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes}`;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

var hiddenStates = [];

function updateTable(data) {
  var tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  data.forEach(function (row, index) {
    var vArr = row.v_arr;
    var newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>
        <button class="btn btn-primary rounded-circle small-btn" onclick="toggleData(${index})">
            <i class="fa-solid fa-plane"></i>
        </button>
      </td>
      <td>${(row.cod_ae && row.v_arr && row.v_dep) ? `${row.cod_ae} ${row.v_arr}<br>${row.cod_ae} ${row.v_dep}` : (row.cod_ae || '-')}</td>
      <td class="text-center align-middle">${row.pea || ''}</td>
      <td class="text-center align-middle">${(row.orig && row.dest) ? `${row.orig}<br>${row.dest}` : row.orig || ''}</td>
      <td class="text-center align-middle">${row.stat || ''}</td>
      <td class="text-center align-middle">${row.sta ? `${formatDate(row.sta)}<br>${formatDate(row.stdd)}` : ''}</td>
      <td class="text-center align-middle">${row.eta ? `${formatDate(row.eta)}${row.etd ? '<br>' + formatDate(row.etd) : '-'}` : '-'}</td>
      <td class="text-center align-middle">${row.ata ? `${formatDate(row.ata)}${row.atd ? '<br>' + formatDate(row.atd) : '-'}` : '-'}</td>

      <td class="cell-with-button">
        <!-- Verificamos si v_arr es diferente de 1364 y ho_ini no está vacío -->
        ${row.ho_ini ? (
          // Si ambas condiciones se cumplen, mostramos el contenido con el botón
          `${row.ho_ini} / ${row.ho_fin}` +
          `<button class="btn green-btn rounded-circle small-btn" id="button-${index}" onclick="mostrarModalPersonalizado(${index})">T</button>`
        ) : (
          // Si es false no llenará nada
          '-'
        )}
      </td>

      <td class="cell-with-button">
        <!-- Verificamos si v_arr es diferente de 1364 y ho_ini no está vacío -->
        ${row.pri_bag ? (
          // Si ambas condiciones se cumplen, mostramos el contenido con el botón
          `${row.pri_bag} / ${row.ul_bag}` +
          `<button class="btn green-btn rounded-circle small-btn" id="button-${index}" onclick="mostrarModalPersonalizado2(${index})">T</button>`
        ) : (
          // Si es false no llenará nada
          '-'
        )}
      </td>

      <td class="cell-with-button">
        <!-- Verificamos si v_arr es diferente de 1364 y ho_ini no está vacío -->
        ${row.dem !== null && row.dem !== ';;'? (
          // Si ambas condiciones se cumplen, mostramos el contenido con el botón
          `${row.dem}` +
          `<button class="btn green-btn rounded-circle small-btn" id="button-${index}" onclick="mostrarModalPersonalizado3(${index})">D</button>`
        ) : (
          // Si es false no llenará nada
          `-`
        )}
      </td>`;
    
    tableBody.appendChild(newRow);

    var hiddenDataRow = document.createElement('tr');
    hiddenDataRow.className = 'hidden-data';
    hiddenDataRow.style.display = 'none';
    hiddenDataRow.innerHTML = 
      `<td><strong>RESPONSABLE CAB.</strong></td>
      <td colspan="3">${row.res || ''}</td>
      <td><strong>EQUIPO CAB.</strong></td>`;
    tableBody.appendChild(hiddenDataRow);

    hiddenDataRow = document.createElement('tr');
    hiddenDataRow.className = 'hidden-data';
    hiddenDataRow.style.display = 'none';
    hiddenDataRow.innerHTML =
      `<td><strong>RESPONSABLE ADU.</strong></td>
      <td colspan="3">${row.res_a || ''}</td>
      <td><strong>CIERRE ADU. </strong></td>
      <td colspan="5">${row.cie || ''}</td>`;
    tableBody.appendChild(hiddenDataRow);

    hiddenStates.push(false, false);
    //updateButtonColor(index);
  });
}

function toggleData(index) {
  var start = index * 2;
  var end = start + 1;

  for (var i = 0; i < hiddenStates.length; i++) {
    hiddenStates[i] = i >= start && i <= end ? !hiddenStates[i] : false;
    document.querySelectorAll('.hidden-data')[i].style.display = hiddenStates[i] ? 'table-row' : 'none';
  }
}

function getData() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/data', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var responseData = JSON.parse(xhr.responseText);
      data = responseData.data;
      updateTable(data);
    }
  };
  xhr.send();
}

function abrirModal() {
  var modal = document.getElementById('miModal');
  modal.style.display = 'flex';
}

function cerrarModal() {
  var modal = document.getElementById('miModal');
  modal.style.display = 'none';
}

function mostrarModalPersonalizado(index) {
  abrirModal();
  if (!data[index]) {
    return;
  }

  currentRow = data[index];
  var modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = `
    <div class="model-content">
      <h4>Datos Generales de Cabina</h4>
      <p><b>RESPONSABLE:</b></p>
      <p>${currentRow.res || ''}</p>
      <p><b>COCKPIT:</b></p>
      <p>${currentRow.coo || ''}</p>
      <p><b>TOILETS:</b></p>
      <p>${currentRow.toi || ''}</p>
      <p><b>GALLEYS:</b></p>
      <p>${currentRow.gal || ''}</p>
      <p><b>ASPIRADO:</b></p>
      <p>${currentRow.asp || ''}</p>
      <p><b>CABINA PAX:</b></p>
      <p>${currentRow.cab_pax || ''}</p>
      <p><b>OBSERVACIONES:</b></p>
      <p>${currentRow.obs_e || ''}</p>
      <p><b>OBSERVACIONES CLIENTE:</b></p>
      <p>${currentRow.obs_cli || ''}</p>    
    </div>
    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `;
}

function mostrarModalPersonalizado2(index) {
  abrirModal();
  if (!data[index]) {
    return;
  }

  currentRow = data[index];
  var modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = `
    <div class="model-content">
      <h4>Datos Generales de Cabina</h4>
      <p><b>RESPONSABLE:</b></p>
      <p>${currentRow.res_a || ''}</p>
      <p><b>CIERRE:</b></p>
      <p>${currentRow.cie || ''}</p>
      <p><b>OBSERVACIONES:</b></p>
      <p>${currentRow.obs_a || ''}</p>
    </div>
    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `;
}

function mostrarModalPersonalizado3(index) {
  abrirModal();
  if (!data[index]) {
    return;
  }

  currentRow = data[index];
  var modalContent = document.querySelector('.modal-content');
  modalContent.innerHTML = `
    <div class="model-content">
      <h4>Demoras</h4>
      <p><b>ENCARGADO DE VUELO:</b></p>
      <p>${currentRow.enc_vue || ''}</p>
      <p><b>OBSERVACIONES:</b></p>
      <p>${currentRow.obs_gen || ''}</p>
      <p><b>OBSERVACIONES DEMORAS:</b></p>
      <p>${currentRow.obs_dem || ''}</p>
      <p><b>DELAY:</b></p>
      <p>${formatTime(currentRow.dem_min) || ''}</p>
    </div>
    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `;
}

getData();
setInterval(getData, 30000);

var aerolineaTiempos = {
  '342': [2, 5], // VOLARIS Y4
  '6653': [55, 60], // IBERIA IB6653
  '175': [55, 60], // AIREUROPA UX
  '340': [2, 5], // VOLARIS Y4
  '4110': [2, 5], // VOLARIS Q6
  '6659': [25, 30], // IBERIA IB6659
  '748': [10, 15], // BOA OB
  '1825': [5, 10], // JETBLUE B6
};


var aerolineaTiempos2 = {
  '342': [20, 25], // VOLARIS Y4
  '6653': [55, 60], // IBERIA IB6653
  '175': [55, 60], // AIREUROPA UX
  '340': [20, 25], // VOLARIS Y4
  '4110': [20, 25], // VOLARIS Q6
  '6659': [55, 60], // IBERIA IB6659
  '748': [20, 25], // BOA OB
  '1825': [20, 25], // JETBLUE B6
};

getData();
var intervalId = setInterval(getData, 60000);

function updateButtonColor(buttonElement, startTime, endTime, arrivalFlight) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(parseInt(startTime.split(':')[0]));
  start.setMinutes(parseInt(startTime.split(':')[1]));

  const end = new Date(now);
  end.setHours(parseInt(endTime.split(':')[0]));
  end.setMinutes(parseInt(endTime.split(':')[1]));

  // Calculamos la diferencia en minutos entre endTime y startTime
  const timeDifferenceMinutes = (end - start) / (1000 * 60);

  // Comparamos la diferencia de tiempo para asignar el color adecuado
  if (timeDifferenceMinutes <= aerolineaTiempos[arrivalFlight][0]) {
    buttonElement.classList.remove('yellow-btn', 'red-btn');
    buttonElement.classList.add('green-btn');
  } else if (timeDifferenceMinutes <= aerolineaTiempos[arrivalFlight][1]) {
    buttonElement.classList.remove('green-btn', 'red-btn');
    buttonElement.classList.add('yellow-btn');
  } else {
    buttonElement.classList.remove('green-btn', 'yellow-btn');
    buttonElement.classList.add('red-btn');
  }
}

function updateButtonColor2(buttonElement, startTime, endTime, arrivalFlight) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(parseInt(startTime.split(':')[0]));
  start.setMinutes(parseInt(startTime.split(':')[1]));

  const end = new Date(now);
  end.setHours(parseInt(endTime.split(':')[0]));
  end.setMinutes(parseInt(endTime.split(':')[1]));

  // Calculamos la diferencia en minutos entre endTime y startTime
  const timeDifferenceMinutes = (end - start) / (1000 * 60);

  // Comparamos la diferencia de tiempo para asignar el color adecuado
  if (timeDifferenceMinutes <= aerolineaTiempos2[arrivalFlight][0]) {
    buttonElement.classList.remove('yellow-btn', 'red-btn');
    buttonElement.classList.add('green-btn');
  } else if (timeDifferenceMinutes <= aerolineaTiempos2[arrivalFlight][1]) {
    buttonElement.classList.remove('green-btn', 'red-btn');
    buttonElement.classList.add('yellow-btn');
  } else {
    buttonElement.classList.remove('green-btn', 'yellow-btn');
    buttonElement.classList.add('red-btn');
  }
}

var currentRow = {};

function formatDate(dateString) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const date = new Date(dateString);
  if (isNaN(date)) {
    return '';
  }
  //const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  //const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes}`;
}

function formatTime1(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return '';
  }
  //const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  //const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTime(timeString) {
  const timeParts = timeString.split(':'); // Dividimos la cadena en partes (horas, minutos, segundos)
  if (timeParts.length >= 2) {
    const hours = timeParts[0];
    const minutes = timeParts[1];
    return `${hours}:${minutes}`;
  } else {
    return '';
  }
}


var hiddenStates = [];

function updateTable(data) {
  var tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  data.forEach(function (row, index) {
    var newRow = document.createElement('tr');
    newRow.innerHTML = `
      <!-- <td>
        <button class="btn btn-primary rounded-circle small-btn" onclick="toggleData(${index})">
            <i class="fa-solid fa-plane"></i>
        </button>
      </td> -->
      <td>${(row.cod_ae && row.v_arr && row.v_dep) ? `${row.cod_ae} ${row.v_arr}<br>${row.cod_ae} ${row.v_dep}` : (row.cod_ae || '-')}</td>
      <td class="text-center align-middle">${row.pea || ''}</td>
      <td class="text-center align-middle">${(row.orig && row.dest) ? `${row.orig}<br>${row.dest}` : row.orig || ''}</td>
      <td class="text-center align-middle">${row.stat || ''}</td>
      <td class="text-center align-middle">${row.sta ? `${formatDate(row.sta)}<br>${formatDate(row.stdd)}` : ''}</td>
      <td class="text-center align-middle">${row.eta ? `${formatDate(row.eta)}${row.etd ? '<br>' + formatDate(row.etd) : '-'}` : '-'}</td>
      <td class="text-center align-middle">${row.ata ? `${formatDate(row.ata)}${row.atd ? '<br>' + formatDate(row.atd) : '-'}` : '-'}</td>

      <td class="cell-with-button">
        ${row.ho_ini ? (
          `${formatTime(row.ho_ini)} / ${row.ho_fin !== null ? formatTime(row.ho_fin) : ''}` +
          `<button class="btn small-btn ho-ini-button" onclick="mostrarModalPersonalizado(${index})">
          <i class="fa-solid fa-pump-soap"></i>
          </button>`
        ) : (
          '-'
        )}
      </td>


      <td class="cell-with-button">
        <!-- Verificamos si v_arr es diferente de 1364 y ho_ini no está vacío -->
        ${row.pri_bag ?  (
          // Si ambas condiciones se cumplen, mostramos el contenido con el botón
          `${formatTime(row.pri_bag)} / ${row.ul_bag !== null ? formatTime(row.ul_bag) : ''}` +
          `<button class="btn small-btn ho-ini-bag" id="button-${index}" onclick="mostrarModalPersonalizado2(${index})">
          <i class="fa-solid fa-cart-flatbed-suitcase"></i>
          </button>`
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
          `<button class="btn red-btn rounded-circle small-btn" id="button-${index}" onclick="mostrarModalPersonalizado3(${index})">
          <i class="fa-solid fa-plane-departure"></i>
          </button>`
        ) : (
          // Si es false no llenará nada
          `-`
        )}
      </td>`;

    var hoIniButton = newRow.querySelector('.ho-ini-button');
    if (hoIniButton) {
      updateButtonColor(hoIniButton, row.ho_ini, row.ho_fin, row.v_arr);
    }

    var hoIniBag = newRow.querySelector('.ho-ini-bag');
    if (hoIniBag) {
      updateButtonColor2(hoIniBag, row.pri_bag, row.ul_bag, row.v_arr);
    }
    
    tableBody.appendChild(newRow);

    /*var hiddenDataRow = document.createElement('tr');
    hiddenDataRow.className = 'hidden-data';
    hiddenDataRow.style.display = 'none';
    hiddenDataRow.innerHTML = 
      `<td><strong>RESPONSABLE CAB.</strong></td>
      <td colspan="3">${row.res || ''}</td>
      <td><strong>EQUIPO CAB.</strong></td>`;
    tableBody.appendChild(hiddenDataRow);*/

    /*hiddenDataRow = document.createElement('tr');
    hiddenDataRow.className = 'hidden-data';
    hiddenDataRow.style.display = 'none';
    hiddenDataRow.innerHTML =
      `<td><strong>RESPONSABLE ADU.</strong></td>
      <td colspan="3">${row.res_a || ''}</td>
      <td><strong>CIERRE ADU. </strong></td>
      <td colspan="5">${row.cie || ''}</td>`;*/
    //tableBody.appendChild(hiddenDataRow);

    hiddenStates.push(false, false);
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

          // Reinicia el intervalo
          clearInterval(intervalId);
          intervalId = setInterval(getData, 60000);
      }
  };
  xhr.send();
}


function filtrarPorFecha() {
  var fechaInicio = document.getElementById('fechaInicio').value;
  var fechaFin = document.getElementById('fechaFin').value;
  var aerolinea = document.getElementById('aerolinea').value;

  clearInterval(intervalId);

  if (aerolinea && (!fechaInicio || !fechaFin)) {
    alert('Por favor, selecciona ambas fechas cuando especificas una aerolínea.');
    return;
}

if ((fechaInicio && fechaFin) || aerolinea) {
  obtenerDatosFiltrados(fechaInicio, fechaFin, aerolinea);
  
  } else {
    intervalId = setInterval(getData, 60000);
    alert('Por favor, selecciona al menos una fecha o una aerolínea.');
  }

}

function obtenerDatosFiltrados(fechaInicio, fechaFin, aerolinea) {
  
  var url = '/filtraje?';
  var params = [];
  if (fechaInicio) params.push('inicio=' + encodeURIComponent(fechaInicio));
  if (fechaFin) params.push('fin=' + encodeURIComponent(fechaFin));
  if (aerolinea) params.push('aerolinea=' + encodeURIComponent(aerolinea));


  fetch(url + params.join('&'))
        .then(response => response.json())
        .then(datos => {
            // Procesa los datos recibidos
            updateTable(datos);
        });
  
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
      <p>${currentRow.min_dem || ''}</p>
    </div>
    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `;
}
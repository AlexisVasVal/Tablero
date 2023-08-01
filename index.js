require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
//const moment = require('moment');

const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "tablero",
  password: process.env.PGPASSWORD || "123456",
  port: process.env.PGPORT || "5432",
});

// Diccionario para el reemplazo del campo stat
function reemplazar(dato) {
  const reemplazos = {
    'TURNAROUND': 'T/A',
    'LLEGADA': 'LLEG',
    'SALIDA': 'SAL',
    'CANCELADO':'CXL'
    // Agrega más reemplazos según tus necesidades
  };

  return reemplazos[dato] || dato; // Si no se encuentra el valor en el diccionario, se mantiene el mismo valor
}




async function getDataAndInsert(table, url, columns) {
  try {
    const response = await axios.get(url);
    const jsonData = response.data;

    for (const row of jsonData.data) {
      try {
        const insertQuery = {
          text: `INSERT INTO ${table} (${columns.join(', ')}) 
                 VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')}) 
                 ON CONFLICT (${columns[0]}) DO UPDATE 
                 SET ${columns.slice(1).map((column, index) => `${column} = $${index + 2}`).join(', ')}`,
          values: columns.map(column => row[column]),
        };

        const result = await pool.query(insertQuery);
        if (result.rowCount > 0) {
          console.log(`Registro insertado o actualizado en tabla ${table}:`, result.rowCount);
        }
      } catch (error) {
        console.error(`Error al insertar o actualizar el registro en tabla ${table}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error al obtener el JSON de ${url}:`, error);
  }
}



async function fetchDataAndInsert() {
  await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbwE3e9BTJWQWGBf-vOH2U1qL5a0OmE0D8tflpIPc2uanWGyNd2UyT04EQirUuf4xg7HTw/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat']);
  // -- await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbyUu9UeC608S5ys8nZAKrpO1gt5HnkwcFxyT3swpyqQb0SkinT_rNBUq1_hbH7G-1SUww/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat']);
  await getDataAndInsert('aduan', 'https://script.google.com/macros/s/AKfycbwxcvqPxBVLTNQOoDmgTb6EN0ZOZo-FoRpQcusNwDTHfRPZvYF1mJbDN7x-3zH8PvE/exec', ['vuelo', 'pri_bag', 'ul_bag', 'cie', 'obs', 'res_a']);
  await getDataAndInsert('evacab', 'https://script.google.com/macros/s/AKfycbxunPRdnJoTMsVPnZHcV0j6mStI_e1FA_2wnkej85dGy-OTUTo9FyDQV4Wp12D7ba5wcA/exec', ['vuelo', 'ho_ini', 'ho_fin', 'obs', 'res', 'cal_pun', 'cal_pre', 'cal_act', 'cal_mat', 'cal_res', 'tip_lim', 'obs_cli', 'coo', 'toi', 'gal', 'asp', 'cab_pax']);
  await getDataAndInsert('datosgenerales', 'https://script.google.com/macros/s/AKfycbys-iGCyHgyHyaerfJdhjmKiG5P0AQHX50llmW2g_XeVNWZyWu2p6GTL97mxbuMmArb/exec', ['vuelo', 'mat', 'eta', 'etd', 'ata', 'atd', 'pea','pax_in', 'pax_out', 'kg_in', 'kg_out', 'com', 'uni', 'dem', 'dem_min', 'hor_tie', 'min_dem', 'rps', 'obs_dem', 'obs_gen', 'enc_vue', 'stat']);
}

fetchDataAndInsert();
setInterval(fetchDataAndInsert, 60000);

// Resto del código...

app.get('/', async (req, res) => {
  try {
    const query = `
    SELECT i.aer, i.sta, d.pea, d.eta, d.ata, i.v_arr, e.res ,e.ho_ini, e.ho_fin,
    a.res_a ,a.pri_bag, a.ul_bag, a.cie, d.etd, d.atd, d.stat, d.dem
    FROM itinera i
    LEFT JOIN
    aduan a ON a.vuelo = i.vuelo
    LEFT JOIN
    evacab e ON i.vuelo = e.vuelo
    LEFT JOIN
    datosgenerales d ON i.vuelo = d.vuelo
    WHERE
    sta >= NOW() - INTERVAL '10 hours'
    AND sta <= NOW() + INTERVAL '10 hours'
    ORDER BY sta ASC
    `;
    const result = await pool.query(query);
    const rows = result.rows;

    res.render('index', { data: rows });
  } catch (error) {
    console.error('NO SALE PS:', error);
    res.status(500).send('NO SALE PS 2');
  }
});

app.get('/data', async (req, res) => {
  try {
    const query = `
    SELECT i.aer, i.sta, d.pea, d.eta, d.ata, i.v_arr, e.res ,e.ho_ini, e.ho_fin,
    a.res_a ,a.pri_bag, a.ul_bag, a.cie, d.etd, d.atd, d.stat, d.dem
    FROM itinera i
    LEFT JOIN
    aduan a ON a.vuelo = i.vuelo
    LEFT JOIN
    evacab e ON i.vuelo = e.vuelo
    LEFT JOIN
    datosgenerales d ON i.vuelo = d.vuelo
    WHERE
    sta >= NOW() - INTERVAL '10 hours'
    AND sta <= NOW() + INTERVAL '10 hours'
    ORDER BY sta ASC
    `;
    const result = await pool.query(query);
    const rows = result.rows;

    res.json({ data: rows });
  } catch (error) {
    console.error('NO SALE PS 3:', error);
    res.status(500).send('NO SALE PS 4');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

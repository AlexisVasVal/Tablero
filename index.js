const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const moment = require('moment');

const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const pool = new Pool({
  user:process.env.DB_USER || 'postgres',
  host:process.env.DB_HOST || 'localhost',
  database:process.env.DB_NAME || 'tableros',
  password:process.env.DB_PASSWORD || '123456',
  port:process.env.DB_PORT || 5432,
});

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
  await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbyd4POhnW00wDk9cHgdNI-UDnTQFTV2XYzc9hsSvPLo3MuS2DwCO0tu0K29ElQ3G1xUDw/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat']);
  // -- await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbyUu9UeC608S5ys8nZAKrpO1gt5HnkwcFxyT3swpyqQb0SkinT_rNBUq1_hbH7G-1SUww/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat']);
  await getDataAndInsert('aduan', 'https://script.google.com/macros/s/AKfycbzn9AIg9FXlkrJEzL98RpRtmzH35kJw-lkoeRw_drbFKzJ48Ds8iXCyzVwkPCNQkSi0/exec', ['vuelo', 'pri_bag', 'ul_bag', 'cie', 'obs', 'res_a']);
  await getDataAndInsert('evacab', 'https://script.google.com/macros/s/AKfycbym-FPz2xLFV-B_5_Az0L9ukzUynZIqnJvn48aQL6ObElKfGlUk1dGmEOM4Y1z8NAviGQ/exec', ['vuelo', 'ho_ini', 'ho_fin', 'obs', 'ata_pre', 'res', 'cal_pun', 'cal_pre', 'cal_act', 'cal_mat', 'cal_res', 'tip_lim', 'obs_cli', 'coo', 'toi', 'gal', 'asp', 'cab_pax']);
  await getDataAndInsert('datosgenerales', 'https://script.google.com/macros/s/AKfycbxQby_Co5l1hCC_FkZrKXQJieTurJgc14sq4zIqmOoOvGrcS-fUq-DVaikpaPri_lSWJA/exec', ['vuelo', 'mat', 'eta', 'etd', 'ata', 'atd', 'pea','pax_in', 'pax_out', 'kg_in', 'kg_out', 'com', 'uni', 'dem', 'dem_min', 'hor_tie', 'min_dem', 'rps', 'obs_dem', 'obs_gen', 'enc_vue', 'stat']);
}

fetchDataAndInsert();
setInterval(fetchDataAndInsert, 300000);

// Resto del código...

app.get('/', async (req, res) => {
  try {
    const query = `
      SELECT i.aer, to_char(i.sta, 'YYYY/MM/DD HH24:MI:SS') as sta, d.pea, to_char(d.eta, 'YYYY/MM/DD HH24:MI:SS') as eta, to_char(d.ata, 'YYYY/MM/DD HH24:MI:SS') as ata, i.v_arr, e.res, to_char(e.ho_ini, 'YYYY/MM/DD HH24:MI:SS') as ho_ini, to_char(e.ho_fin, 'YYYY/MM/DD HH24:MI:SS') as ho_fin,
      a.res_a ,a.pri_bag, a.ul_bag, a.cie, to_char(d.etd, 'YYYY/MM/DD HH24:MI:SS') as etd, to_char(d.atd, 'YYYY/MM/DD HH24:MI:SS') as atd, d.stat, d.dem
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
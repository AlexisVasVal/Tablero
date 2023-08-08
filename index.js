require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
//const moment = require('moment'); asd

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
  await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbxn2xZ4JWspGvA3kh9FRLKja1SiYld1e34N0-mLY1BBPH_6lVi5tROZYJJSiuy23PLFsg/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat', 'cod_ae']);
  await getDataAndInsert('aduan', 'https://script.google.com/macros/s/AKfycbxc8Iltm33VUJl--XoZd2QHebC8BwiyS_9rR1J_2xa1E2urFH3R-jaUQ70x7WCnPzzl/exec', ['vuelo', 'pri_bag', 'ul_bag', 'cie', 'obs', 'res_a']);
  await getDataAndInsert('evacab', 'https://script.google.com/macros/s/AKfycbzjmjWzVj1APFq53mYsMA2kAHtWvIwo3NDQC4uE7ktquZmRalpXVQxgImjuHXm0oorqRw/exec', ['vuelo', 'ho_ini', 'ho_fin', 'obs', 'res', 'cal_pun', 'cal_pre', 'cal_act', 'cal_mat', 'cal_res', 'tip_lim', 'obs_cli', 'coo', 'toi', 'gal', 'asp', 'cab_pax', 'ata_pre']);
  await getDataAndInsert('datosgenerales', 'https://script.google.com/macros/s/AKfycbys-iGCyHgyHyaerfJdhjmKiG5P0AQHX50llmW2g_XeVNWZyWu2p6GTL97mxbuMmArb/exec', ['vuelo', 'mat', 'eta', 'etd', 'ata', 'atd', 'pea','pax_in', 'pax_out', 'kg_in', 'kg_out', 'com', 'uni', 'dem', 'dem_min', 'hor_tie', 'min_dem', 'rps', 'obs_dem', 'obs_gen', 'enc_vue', 'stat']);
}

fetchDataAndInsert();
setInterval(fetchDataAndInsert, 60000);

// Resto del código...

app.get('/', async (req, res) => {
  try {
    const query = `
    SELECT i.cod_ae, i.sta, i.stdd, d.pea, d.eta, d.ata, i.v_arr, i.v_dep, e.res,
    e.ho_ini, e.ho_fin,a.res_a ,a.pri_bag, a.ul_bag, a.cie, d.etd, d.atd, d.stat,
    d.dem, i.orig, i.dest, e.toi, e.coo, e.gal, e.asp, e.cab_pax, e.obs_cli, 
    e.obs as obs_e, a.obs as obs_a, d.enc_vue, d.obs_gen, d.obs_dem, d.min_dem, 
    d.obs_dem, e.ata_pre
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
    SELECT i.cod_ae, i.sta, i.stdd, d.pea, d.eta, d.ata, i.v_arr, i.v_dep, e.res,
    e.ho_ini, e.ho_fin, a.res_a,a.pri_bag, a.ul_bag, a.cie, d.etd, d.atd, d.stat,
    d.dem, i.orig, i.dest, e.toi, e.coo, e.gal, e.asp, e.cab_pax, e.obs_cli, 
    e.obs as obs_e, a.obs as obs_a, d.enc_vue, d.obs_gen, d.obs_dem, d.min_dem, 
    d.obs_dem, e.ata_pre
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

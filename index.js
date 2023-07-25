const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tableros',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

async function getDataAndInsert(table, url, columns) {
  try {
    const response = await axios.get(url);
    const jsonData = response.data;

    for (const row of jsonData.data) {
      try {
        const formattedRow = columns.map((column) => {
          if (column === 'sta' || column === 'stdd' || column === 'eta' || column === 'etd') {
            return format(new Date(row[column]), "yyyy-MM-dd HH:mm:ss");
          } else {
            return row[column];
          }
        });

        const insertQuery = {
          text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')}) 
                ON CONFLICT (${columns[0]}) DO UPDATE SET ${columns.slice(1).map((column, index) => `${column} = $${index + 2}`).join(', ')}`,
          values: formattedRow,
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
  try {
    await getDataAndInsert('itinera', 'https://script.google.com/macros/s/AKfycbyd4POhnW00wDk9cHgdNI-UDnTQFTV2XYzc9hsSvPLo3MuS2DwCO0tu0K29ElQ3G1xUDw/exec', ['vuelo', 'aer', 'orig', 'v_arr', 'ato', 'v_dep', 'sta', 'stdd', 'dest', 'stat']);
    // Agrega aquí las llamadas a otras funciones para obtener e insertar en otras tablas.
  } catch (error) {
    console.error('Error al obtener o insertar datos:', error);
  }
}

// asd
fetchDataAndInsert();
setInterval(fetchDataAndInsert, 5000);

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
    console.error('Error al obtener los datos:', error);
    res.status(500).send('Error al obtener los datos');
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
    console.error('Error al obtener los datos:', error);
    res.status(500).send('Error al obtener los datos');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

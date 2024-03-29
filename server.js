const express = require('express');
const fs = require('fs');
const fsp = fs.promises; 
const path = require('path');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;
app.use(express.json());

const createCsvWriter = require('csv-writer').createObjectCsvWriter;



// read CSV and return an array of resIDs
async function readCSV(filePath) {
  const resIDs = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  let cnt = 0;
  for await (const row of stream) {
    cnt++;
    if (cnt > 2) resIDs.push(row.ResponseId);
  }
  return resIDs;
}

// filter images by prefix
async function filterImagesByPrefix(folderPath, prefix) {
  //console.log("prefix" + prefix);
  const files = await fsp.readdir(folderPath);
  return files.filter(file => file.startsWith(prefix));
}

// generate image paths
async function generateImagePaths1() {
  const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
  let images = [];

  const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
  const resIDs = await readCSV(filePath);
  for (let folder of folders) {
    const folderPath = path.join(__dirname, 'public', 'images', folder);
    for (let resID of resIDs) {
      const matchedFiles = await filterImagesByPrefix(folderPath, resID);
      matchedFiles.forEach(file => images.push(`/images/${folder}/${file}`));
    }
  }

  // shuffle 
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [images[i], images[j]] = [images[j], images[i]]; 
  }

  return images;
}

// generate image paths
async function generateImagePaths() {
  const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
  let images = [];

  const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
  console.log(filePath);
  const resIDs = await readCSV(filePath);
  for (let folder of folders) {
    const folderPath = path.join(__dirname, 'public', 'images', folder);
    for (let resID of resIDs) {
      const matchedFiles = await filterImagesByPrefix(folderPath, resID);
      matchedFiles.forEach(file => {
        // assign specific image based on folder name
        let specificImagePath = "";
        if(folder == "VE1_4") specificImagePath = `/images/1.png`;
        else if(folder == "VE2_4") specificImagePath = `/images/2.png`
        else if(folder == "VE3_4") specificImagePath = `/images/3.png`
        else if(folder == "VE4_4") specificImagePath = `/images/4.png`
        else if(folder == "VE5_4") specificImagePath = `/images/5.png`
        else if(folder == "VE6_4") specificImagePath = `/images/6.png`
        else specificImagePath = `/images/7.png`
        
        images.push({
          original: `/images/${folder}/${file}`,
          specific: specificImagePath
        });
      });
    }
  }

  // shuffle 
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [images[i], images[j]] = [images[j], images[i]]; 
  }

  return images;
}

// Serve static files from 'public' directory
app.use(express.static('public'));

// API endpoint to fetch image paths
app.get('/api/images', async (req, res) => {
  try {
    images = await generateImagePaths();
    const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
    console.log(filePath);

    const resIDs = await readCSV(filePath);
    console.log(resIDs);

    //console.log(resIDs);
    //images = [];
    //images.push('/images/VE1_4/R_1GC6mVOXXCVavLK_1.png');
    res.json(images);
  } catch (error) {
    console.error('Failed to generate image paths:', error);
    res.status(500).send('Server error!');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







// app.get('api/items',(req,res) => {
//   res.send('sending items from DB')
// })

// app.post('api/items',(req,res) => {
//   res.status(201).send('sent the new data to DB')
// })


// // database

// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'survey_zjns_user',
//   host: 'dpg-cn0n8q0cmk4c73df2kh0-a',
//   database: 'survey_zjns',
//   password: 'nZt3rWMibksMphLRdkJvKVtTRCO9iaUS',
//   port: 5432, // default port for postgres
// });

// app.post('/submit-slider-values', async (req, res) => {
//   const { vividness, original, transform } = req.body;

//   const query = 'INSERT INTO slider_values (vividness, original, transform) VALUES ($1, $2, $3)';

//   try {
//     const client = await pool.connect();

//     try {
//       await client.query(query, [vividness, original, transform]);

//       res.send('Slider values saved successfully.');
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     res.status(500).send('Error saving data to the database');
//     console.error('Error executing query', error.stack);
//   }
// });








//Set up the CSV writer

// const csvWriter = createCsvWriter({
//   path: path.join(__dirname, 'public', 'data', 'surveydata.csv'), // Make sure this path is correct
//   append: true, // This will append records instead of overwriting the file
//   header: [
//     { id: 'vividness', title: 'VIVIDNESS' },
//     { id: 'original', title: 'ORIGINAL' },
//     { id: 'transform', title: 'TRANSFORM' }
//   ]
// });
// console.log(csvWriter);


// // Data to be inserted
// const data = [
//   {
//     vividness: 1,
//     original: 1,
//     transform: 1
//   }
// ];

// // Insert the data into the CSV file
// csvWriter.writeRecords(data)
//   .then(() => {
//     console.log('Data was appended successfully into the file');
//   })
//   .catch(err => {
//     console.error('An error occurred:', err);
//   });

// app.post('/api/submit-slider-values', async (req, res) => { // Corrected the route here
//   // Extract slider values from the request body
//   const { vividness, original, transform } = req.body;

//   // Create a record object matching the CSV writer headers
//   const record = [
//     { vividness, original, transform }
//   ];

//   try {
//     // Write the record to the CSV file
//     await csvWriter.writeRecords(record);

//     // If no error, send a success message to the client
//     res.send('Slider values saved successfully to CSV.');
//   } catch (error) {
//     // If an error occurs, send the error to the client
//     res.status(500).send('Error saving data to the CSV file');
//     console.error('Error writing to CSV file', error);
//   }
// });

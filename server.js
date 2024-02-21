const express = require('express');
const fs = require('fs');
const fsp = fs.promises; 
const path = require('path');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;
app.use(express.json());

//const createCsvWriter = require('csv-writer').createObjectCsvWriter;
app.use(express.static('public')); 


// read CSV and return an array of resID
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

// read CSV and return an array of array of title corresponding to resID
// ie. [[VE1_5,...VE7_5], [VE1_5,...VE7_5]]
async function readCSVt(filePath) {
  const titles = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  let cnt = 0;
  for await (const row of stream) {
    cnt++;
    const titleRow = [];
    if (cnt > 2){
      for(let i = 1; i <= 7; i++) {
        const nm = `VE${i}_5`; 
        titleRow.push(row[nm]); 
      }
      titles.push(titleRow); 
    }
    
  }

  return titles;
}
// filter images by prefix
async function filterImagesByPrefix(folderPath, prefix) {
  //console.log("prefix" + prefix);
  const files = await fsp.readdir(folderPath);
  return files.filter(file => file.startsWith(prefix));
}

// generate image paths
async function generateImagePaths() {
  const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
  let images = [];

  const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
  //console.log(filePath);
  const resIDs = await readCSV(filePath);
  //console.log(resIDs);
  const titless = await readCSVt(filePath);
  //console.log(titless);
  for (let folder of folders) {
    const folderPath = path.join(__dirname, 'public', 'images', folder);
    for (let i = 0; i < resIDs.length; i++) {
      const resID = resIDs[i];
      const titles = titless[i];
      const matchedFiles = await filterImagesByPrefix(folderPath, resID);
      matchedFiles.forEach(file => {
        // assign specific image based on folder name
        let specificImagePath = "";
        let title = "";
        if(folder == "VE1_4") {
          specificImagePath = `/images/1.png`;
          title = titles[0];
        }
        else if(folder == "VE2_4") {
          specificImagePath = `/images/2.png`;
          title = titles[1];
        }
        else if(folder == "VE3_4") {
          specificImagePath = `/images/3.png`;
          title = titles[2];
        }
        else if(folder == "VE4_4") {
          specificImagePath = `/images/4.png`;
          title = titles[3];
        }
        else if(folder == "VE5_4") {
          specificImagePath = `/images/5.png`;
          title = titles[4];
        }
        else if(folder == "VE6_4") {
          specificImagePath = `/images/6.png`;
          title = titles[5];
        }
        else {
          specificImagePath = `/images/7.png`;
          title = titles[6];
        }
        
        images.push({
          original: `/images/${folder}/${file}`,
          specific: specificImagePath,
          title: title
        });
      });
    }
  }
  

  // shuffle 
  const rng = LCG(12345); 
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }

  return images;
}

function LCG(seed) {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  let state = seed ? seed : Math.floor(Math.random() * m);

  return function() {
    state = (a * state + c) % m;
    return state / m;
  };
}

// Serve static files from 'public' directory
app.use(express.static('public'));

function hashProIDtoSetNum(pidDec, totalSets) {  
    
    return (pidDec % totalSets) + 1; 
}

app.get('/api/images', async (req, res) => {
  try {
      // Assuming PROLIFIC_PID is passed as a query parameter and should be parsed from hexadecimal
      const prolificPID = parseInt(req.query.PROLIFIC_PID, 16);
      
      const images = await generateImagePaths();
      
      const imagesPerSet = 7; 
      const totalSets = Math.floor(images.length / imagesPerSet); // Ensure totalSets is an integer

      // hash the PID to get a set number
      const setNumber = hashProIDtoSetNum(prolificPID, totalSets);
      
      const startIndex = (setNumber - 1) * imagesPerSet;
      const endIndex = startIndex + imagesPerSet;
      const selectedImages = images.slice(startIndex, endIndex);

      res.json(selectedImages);
  } catch (error) {
      console.error('Failed to generate image paths:', error);
      res.status(500).send('Server error!');
  }
});

// catch-all route to serve index.html for any non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




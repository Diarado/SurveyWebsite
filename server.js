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
  console.log("prefix" + prefix); // prefix is respondID
  const files = await fsp.readdir(folderPath);
  return files.filter(file => file.startsWith(prefix));
}

// Read image evaluation counts
async function readImageCounts() {
  const filePath = path.join(__dirname, 'imageCounts.json');
  try {
    const data = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it
    console.log(`File not found. Creating new file at ${filePath}`);
    await writeImageCounts({});
    return {};
  }
}

  
  // Write image evaluation counts
  async function writeImageCounts(counts) {
    try {
      // Make sure the directory exists
      const filePath = path.join(__dirname, 'imageCounts.json');
      await fsp.writeFile(filePath, JSON.stringify(counts, null, 2));
      console.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
      console.error('Error writing image counts:', error);
    }
  }
  

async function generateImagePaths() {
    const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
    let images = [];
  
    const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
    const resIDs = await readCSV(filePath); // Respond IDs in the list [R_4HSAV9DsD7kAcSZ, ...]
    const titles = await readCSVt(filePath);// [[title1,title2,...title7][title1,title2...]] pusehd by row
  
    for (let folder of folders) {
      const folderIndex = parseInt(folder.split('_')[1]) - 4; // this is 0 (4-4)
      const folderPath = path.join(__dirname, 'public', 'images', folder);
      for (let i = 0; i < resIDs.length; i++) {
        const resID = resIDs[i];
        const matchedFiles = await filterImagesByPrefix(folderPath, resID);// finding 7 images made by resID
        matchedFiles.forEach(file => {
          let specificImagePath = `/images/${folderIndex + 1}.png`; // Ensures correct image mapping
          let title = titles[i][folderIndex]; // Aligns titles with specific images
  
          images.push({
            original: `/images/${folder}/${file}`,
            specific: specificImagePath,
            title: title
          });
        });
      }
    }
  
    // Shuffle images to randomize output
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

      const prolificPID = parseInt(req.query.PROLIFIC_PID, 16);

      let images = await generateImagePaths();

      // Read the current image evaluation counts
      const imageCounts = await readImageCounts();

      // Shuffle images based on evaluation counts
      images = images.map(image => ({
        ...image,
        count: imageCounts[image.original] || 0
      })).sort((a, b) => a.count - b.count);

      // Calculate how many images to send and total sets
      const imagesPerSet = 7; 
      const totalSets = Math.floor(images.length / imagesPerSet); 

      // Hash the PID to get a set number
      const setNumber = hashProIDtoSetNum(prolificPID, totalSets);

      const startIndex = (setNumber - 1) * imagesPerSet;
      const endIndex = startIndex + imagesPerSet;
      const selectedImages = images.slice(startIndex, endIndex);

      // Update the counts for the selected images
      selectedImages.forEach(image => {
        imageCounts[image.original] = (imageCounts[image.original] || 0) + 1;
      });
      await writeImageCounts(imageCounts);

      // Send the selected images
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



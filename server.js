const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;

// read CSV and return an array of resIDs
async function readCSV(filePath) {
  const resIDs = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  for await (const row of stream) {
    resIDs.push(row.ResponseId);
  }
  return resIDs;
}

// filter images by prefix
async function filterImagesByPrefix(folderPath, prefix) {
  const files = await fs.readdir(folderPath);
  return files.filter(file => file.startsWith(prefix));
}

// generate image paths
async function generateImagePaths() {
  const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
  let images = [];

  const filePath = path.join(__dirname, 'data/dat.csv');
  console.log(filePath);
  const resIDs = await readCSV(filePath);
  console.log(resIDs);
  for (let folder of folders) {
    const folderPath = path.join(__dirname, 'public/images', folder);
    for (let resID of resIDs) {
      const matchedFiles = await filterImagesByPrefix(folderPath, resID);
      matchedFiles.forEach(file => images.push(`${folder}/${file}`));
    }
  }

  // shuffle the images array if needed

  return images;
}

// Serve static files from 'public' directory
app.use(express.static('public'));

// API endpoint to fetch image paths
app.get('/api/images', async (req, res) => {
  try {
    //const images = await generateImagePaths();
    images = [];
    images.push('/images/VE1_4/R_1GC6mVOXXCVavLK_1.png');

    res.json(images);
  } catch (error) {
    console.error('Failed to generate image paths:', error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


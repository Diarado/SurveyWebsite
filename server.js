const express = require('express');
const fs = require('fs');
const fsp = fs.promises; 
const path = require('path');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;
app.use(express.json());


const { initializeApp} = require("firebase/app");
const { getDatabase,ref,onValue,get } = require("firebase/database");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXNN7TE_8-HIdR75kqQ47imZhrg3Qtfks",
  authDomain: "imageeval-dd6e8.firebaseapp.com",
  databaseURL: "https://imageeval-dd6e8-default-rtdb.firebaseio.com",
  projectId: "imageeval-dd6e8",
  storageBucket: "imageeval-dd6e8.appspot.com",
  messagingSenderId: "238433835181",
  appId: "1:238433835181:web:ca3ce01a2ad81408894e24",
  measurementId: "G-5B424981D1"
};

// Initialize Firebase
const app_ = initializeApp(firebaseConfig);
const database = getDatabase(app_);

const dbref = ref(database);













// dbref.then('value', (snapshot) => {
//   console.log(snapshot.val());
// }, (errorObject) => {
//   console.log('The read failed: ' + errorObject.name);
// });







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



async function readCSVmentalImage(filePath) {
  const selected_mentalimages = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  let cnt = 0;
  for await (const row of stream) {
    cnt++;
    const mtImgRow = [];
    if (cnt > 2){
      for(let i = 1; i <= 7; i++) {
        const nm = `VE${i}_2`; 
        mtImgRow.push(row[nm]); 
      }
      selected_mentalimages.push(mtImgRow); 
    }
    
  }

  return selected_mentalimages;
}









// filter images by prefix
async function filterImagesByPrefix(folderPath, prefix) {
  // console.log("prefix" + prefix); // prefix is respondID
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
      // console.log(`Successfully wrote to ${filePath}`);
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
    const selected_mental_image = await readCSVmentalImage(filePath);
  
    for (let [index, folder] of folders.entries()) {
      const folderIndex = index;
      const folderPath = path.join(__dirname, 'public', 'images', folder);
      for (let i = 0; i < resIDs.length; i++) {
        const resID = resIDs[i];

        if (["R_8CHzbhc4JOBRLV5", "R_4EXsi7EL6HEfhqV", "R_64wIzqV3gaB8jg5","R_2gR9TZkBpOxnHXn","R_1xYwybmsBKXYG1i","R_3w1stHdOBj2sfU1","R_2X0QOil3OprDtr2"].includes(resID)) {
          const matchedFiles = await filterImagesByPrefix(folderPath, resID);// finding 7 images made by resID
          matchedFiles.forEach(file => {
  
            let originalImagePath = `/images/${folderIndex + 1}.png`; // Ensures correct image mapping
            let title = titles[i][folderIndex]; // Aligns titles with specific images
            let mentalImg = selected_mental_image[i][folderIndex]; // Aligns titles with specific images
    
            images.push({
    //           original: `/images/${folder}/${file}`,
    //           specific: originalImagePath,
              original: originalImagePath,
              userdrawn: `/images/${folder}/${file}`,
              filename: file,
              title: title,
              mentalImg: mentalImg
            });
            // console.log("++++++++")
            // console.log(images.length)
          });// Your code here


        }
       
      }
    }
  
    // console.log(images) // this is every image [ { original: '/images/3.png', userdrawn: '/images/VE3_4/R_2iQEpAvThRh1RuV_3.png', title: 'Car going over a speed bump'},{},...300ish]
    
    // Shuffle images to randomize output
    const rng = LCG(12345); //random seed
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
    
    // return (pidDec % totalSets) + 1; 
    return (pidDec%(totalSets/3))+1;
}

app.get('/api/images', async (req, res) => {
  try {

      const prolificPID = parseInt(req.query.PROLIFIC_PID, 16);

      let images = await generateImagePaths();

      let snapshot = await get(dbref)
      // console.log("++++++++")
      // console.log(images.length)


      // console.log(snapshot)
      // onValue(dbref,(snapshot) => {
      // console.log(snapshot.val());
        let db = snapshot.val()["users"]
        const imagecount = {}
        for (user in db){
          let evaluations = db[user] // 35 image evaluations image:, scores:{},userProlificID:  by each user
          for(evaluation of evaluations){
            if (evaluation){
              let image = evaluation['image']
              // console.log(evaluation)
              
              if (!(image in imagecount)){
                imagecount[image] = 0
              } 
              imagecount[image]++         
              }
            }
          } 
        // console.log(imagecount)
      
        images = images.map(image => ({
          ...image,
          count: imagecount[image.filename] || 0
        })).sort((a, b) => a.count - b.count);
      

        // console.log("======")
        // console.log(images.length) // 322
        // console.log(JSON.stringify(images, null, 4))
       

      // }, (errorObject) => {
      //   console.log('The read failed: ' + errorObject.name);
      // })

      // // Read the current image evaluation counts
      // const imageCounts = await readImageCounts();

      // // Shuffle images based on evaluation counts
      // images = images.map(image => ({
      //   ...image,
      //   count: imageCounts[image.userdrawn] || 0
      // })).sort((a, b) => a.count - b.count);

      // Calculate how many images to send and total sets
      const imagesPerSet = 35; 
      // console.log(images.length)
      const totalSets = Math.floor(images.length / imagesPerSet); 

      // Hash the PID to get a set number
      const setNumber = hashProIDtoSetNum(prolificPID, totalSets);

      // const startIndex = (setNumber - 1) * imagesPerSet;

      let startIndex = Math.floor(((prolificPID % 4) / 4) * (images.length-imagesPerSet-1) / 3.0)
      const endIndex = startIndex + imagesPerSet;
      const selectedImages = images.slice(startIndex, endIndex);

      // Update the counts for the selected images
      // selectedImages.forEach(image => {
      //   imageCounts[image.userdrawn] = (imageCounts[image.userdrawn] || 0) + 1;
      // });
      // await writeImageCounts(imageCounts);

      // Send the selected images
      res.json(selectedImages);
  } catch (error) {
      console.error('Failed to generate image paths:', error);
      res.status(500).send('Server error!');
  }
});



app.get('/api/status', async (req, res)=> {

  let images = await generateImagePaths();



  let snapshot = await get(dbref)
      // console.log(snapshot)
      // onValue(dbref,(snapshot) => {
      // console.log(snapshot.val());
        let db = snapshot.val()["users"]
        const imagecount = {}
        for (user in db){
          let evaluations = db[user] // 35 image evaluations image:, scores:{},userProlificID:  by each user
          for(evaluation of evaluations){
            if (evaluation){
              let image = evaluation['image']
              // console.log(evaluation)
              
              if (!(image in imagecount)){
                imagecount[image] = 0
              } 
              imagecount[image]++         
              }
            }
          } 
        // console.log(imagecount)

        images = images.map(image => ({
          name: image.filename,
          count: imagecount[image.filename] || 0
        })).sort((a, b) => a.count - b.count);
      

        // console.log("====")
        // console.log(images.length)
        // console.log(images)
        res.json(images);
})





// catch-all route to serve index.html for any non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});













app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




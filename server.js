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
    if (cnt > 2 ){
      if (row.Finished === 'TRUE'){
        // console.log(row.Finished)
        // console.log(typeof row.Finished)
        resIDs.push(row.ResponseId);  //ResponseId is column name
      }
     
    } 
      
  }
  return resIDs;
}




async function readCSVPID(filePath) {
  const PIDs = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  
  let cnt = 0;
  for await (const row of stream) {
    // console.log(row)
    cnt++;
    if (cnt > 2 ){
      if (row.Finished === 'TRUE'){
        // console.log(row.Finished)
        // console.log(typeof row.Finished)
        PIDs.push(row.PROLIFIC_PID);  //ResponseId is column name
      }
     
    } 
      
  }
  return PIDs;
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
    if (cnt > 2 && row.Finished === 'TRUE'){
      for(let i = 1; i <= 7; i++) {
        const nm = `VE${i}_5`; //condition1
        // const nm = `VE${i}_6`; //condition2
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
    if (cnt > 2 && row.Finished === 'TRUE'){
      for(let i = 1; i <= 7; i++) {
        const nm = `VE${i}_2`; // for condition1
        // const nm = `VE${i}_4`; // for condition2
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


  async function ImageNameChangeFolder(filePath){
    //change image file names in the folers
    const files = await fsp.readdir(filePath);
    // console.log("+++++++")
  
    let foldernumber = filePath.slice(-3, -2);
    // console.log(typeof foldernumber)
    // console.log(files)

    files.forEach(file => {
      // const filePath = path.join(folderPath_condition2, file);
      const fileExt = path.extname(file);
      const baseName = path.basename(file, fileExt);

      let imageNum = baseName.split('_').slice(2).join('_');
      let submissionID = baseName.split('_').slice(0, 2).join('_');
  
      // console.log(baseName)
      // console.log(imageNum)
      // console.log(submissionID)

      if (foldernumber =='1' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      if (foldernumber =='2' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      if (foldernumber =='3' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      if (foldernumber =='4' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      
      if (foldernumber =='5' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      if (foldernumber =='6' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }

      if (foldernumber =='7' && baseName!= '.DS_Store'){
        const newName = `${submissionID + '_'+foldernumber + fileExt}`;
        // console.log(`oldname: ${baseName}`);
        // console.log(`newname: ${submissionID + '_'+foldernumber + fileExt}`);
        const oldPath = path.join(filePath, file);
        const newPath = path.join(filePath, newName);

        fs.renameSync(oldPath, newPath);     
      }



    })

  }

  

async function generateImagePaths() {
    const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
    // const folders_condition2 = ["VE1_5", "VE2_5", "VE3_5", "VE4_5", "VE5_5", "VE6_5", "VE7_5"];
    let images = [];
  
    const filePath = path.join(__dirname, 'public', 'data', 'dat.csv');
    // const filePath_condition2 = path.join(__dirname, 'public', 'data', 'data2.csv');
    // const filePath_condition2 = path.join(__dirname, 'public', 'data', 'data2_addition(8).csv'); // condition 2 this is for additional 8 people 56 images 
    const filePath_condition2 = path.join(__dirname, 'public', 'data', 'data1_addition.csv'); // condition 1 this is for additional 10 people 70 images 



    //change filepath to switch between condition 1 and 2
    const resIDs = await readCSV(filePath_condition2); // Respond IDs in the list [R_4HSAV9DsD7kAcSZ, ...]
    const PIDs = await readCSVPID(filePath_condition2);
    // console.log("resIDs")  
    // console.log(PIDs)
    // console.log(PIDs.length)
    const titles = await readCSVt(filePath_condition2);// [[title1,title2,...title7][title1,title2...]] pusehd by row
    const selected_mental_image = await readCSVmentalImage(filePath_condition2);


    

    //change image names in the csv 

    

  
    for (let [index, folder] of folders.entries()) {
      // console.log(folder)
      const folderIndex = index;
      const folderPath = path.join(__dirname, 'public', 'images', folder);
      // const folderPath_condition2 = path.join(__dirname, 'public', 'images_condition2', folder);
      // const folderPath_condition2 = path.join(__dirname, 'public', 'images_condition2_additional', folder);
      const folderPath_condition2 = path.join(__dirname, 'public', 'images_condition1_additional', folder);

      ImageNameChangeFolder(folderPath_condition2);


      for (let i = 0; i < resIDs.length; i++) {
        
        const resID = resIDs[i];
        
        // if (["R_8CHzbhc4JOBRLV5", "R_4EXsi7EL6HEfhqV", "R_64wIzqV3gaB8jg5","R_2gR9TZkBpOxnHXn","R_1xYwybmsBKXYG1i","R_3w1stHdOBj2sfU1","R_2X0QOil3OprDtr2"].includes(resID)) {
        const matchedFiles = await filterImagesByPrefix(folderPath_condition2, resID);// finding 7 images made by resID

        // console.log(matchedFiles)
          // change folderPath to switch conditions
          matchedFiles.forEach(file => {
  
            let originalImagePath = `/images/${folderIndex + 1}.png`; // Ensures correct image mapping
            let title = titles[i][folderIndex]; // Aligns titles with specific images
            let mentalImg = selected_mental_image[i][folderIndex]; // Aligns titles with specific images
    
            images.push({
    //           original: `/images/${folder}/${file}`,
    //           specific: originalImagePath,
              original: originalImagePath,
    //           userdrawn: `/images/${folder}/${file}`,// condition1
              // userdrawn: `/images_condition2/${folder}/${file}`, //condition2
              userdrawn: `/images_condition1_additional/${folder}/${file}`, //condition2_additional
              filename: file,
              title: title,
              mentalImg: mentalImg
            });
            // console.log("++++++++")
            // console.log(images.length)
          });// Your code here


        // }
       
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




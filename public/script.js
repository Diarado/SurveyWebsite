document.addEventListener("DOMContentLoaded", function() {
  let imagePaths = [];
  let currentIndex = 0;

  // Extract the 'PROLIFIC_PID' from the URL query string
  const params = new URLSearchParams(window.location.search);
  const prolificPID = params.get('PROLIFIC_PID') || 'defaultPID';

  // Fetch images using the 'PROLIFIC_PID' as a query parameter
  fetch(`/api/images?PROLIFIC_PID=${prolificPID}`)
    .then(response => response.json())
    .then(data => {
      imagePaths = data;
      if (imagePaths.length > 0) {
        displayImage(imagePaths[currentIndex]);
      } else {
        console.log('No images found for this set.');
      }
    })
    .catch(error => console.error('Error fetching images:', error));

  document.getElementById('nextImage').addEventListener('click', function () {
    if (currentIndex < imagePaths.length - 1) {
      currentIndex++;
      displayImage(imagePaths[currentIndex]);
      resetSliders();
    } else {
      showThankYouMessage();
    }

<<<<<<< HEAD
//==========================================================
    // // Reference to your Firebase project and the database
    // var database = firebase.database();

    // var vividness_value = document.getElementById('vividnessSlider').value;

    // // Data to save
    // var Value = {
    // username: "newUser",
    // email: "newuser@example.com",
    // profile_picture: "newUserProfilePic.jpg",
    // vividness: vividness_value
    // };

    // // Creating a unique key for each user
    // var userId = firebase.database().ref().child('users').push().key;

    // // Writing data to the specified user's ID under the users collection
    // firebase.database().ref('users/' + userId).set(userData, function(error) {
    // if (error) {
    //     // The write failed...
    //     console.log("Data could not be saved." + error);
    // } else {
    //     // Data saved successfully!
    //     console.log("Data saved successfully.");
    // }
    // });
    
//==========================================================


=======
    // Assuming Firebase is correctly initialized and available
    var database = firebase.database();
    var vividness_value = document.getElementById('vividnessSlider').value;
    var userData = {
      username: "newUser",
      email: "newuser@example.com",
      profile_picture : "newUserProfilePic.jpg",
      vividness: vividness_value
    };

    // Creating a unique key for each user
    var userId = firebase.database().ref().child('users').push().key;

    // Writing data to Firebase
    firebase.database().ref('users/' + userId).set(userData, function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        console.log("Data saved successfully.");
      }
    });
>>>>>>> 190395f56176c13d3f3bb709cb1db09c71dc5dc0
  });

  // Listen for criteria button changes
  ['VividnessButton', 'OriginalButton', 'TransformButton'].forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', function () {
      const criterion = buttonId.replace('Button', '').toLowerCase();
      displayPdf(criterion);
    });
  });
});

function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  container.innerHTML = `<img src="${imageData.specific || imageData.original}" alt="Image" style="width:400px; height:400px;">` +
    `<img src="${imageData.original}" alt="Image" style="width:400px; height:400px;">`;
}

function displayPdf(sliderName) {
  const pdfUrls = {
    vividness: './grading_criteria/vividness.pdf', 
    original: './grading_criteria/originality.pdf', 
    transform: './grading_criteria/transformation.pdf' 
  };

  const pdfContainer = document.getElementById("pdfContainer") || createPdfContainer();
  pdfContainer.innerHTML = `<iframe src="${pdfUrls[sliderName]}" style="width:700px; height:1000px;" frameborder="0"></iframe>`;
}

function createPdfContainer() {
  const container = document.createElement('div');
  container.id = "pdfContainer";
  document.body.appendChild(container);
  return container;
}

function showThankYouMessage() {
  const appContent = document.body; 
  appContent.innerHTML = '<h1>Thank You for participating!</h1><p>You can now close this window.</p>';
  appContent.innerHTML += '<button onclick="window.close();">Close Window</button>';
}

function resetSliders() {
  ['vividnessSlider', 'originalSlider', 'transformSlider'].forEach(sliderId => {
    document.getElementById(sliderId).value = 3;
  });
}

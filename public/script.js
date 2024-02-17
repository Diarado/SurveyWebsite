document.addEventListener("DOMContentLoaded", function() {







  let imagePaths = [];
  let currentIndex = 0;

  // to extract set number from URL path
  const setNumberMatch = window.location.pathname.match(/\/(\d+)/);
  const setNumber = setNumberMatch ? setNumberMatch[1] : 1;

  fetch(`/api/images/${setNumber}`)
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


    currentIndex = (currentIndex + 1) % imagePaths.length;
    displayImage(imagePaths[currentIndex]);

    resetSliders();

    if (currentIndex < imagePaths.length - 1) {
          currentIndex++;
          displayImage(imagePaths[currentIndex]);
      } else {
          showThankYouMessage();
      }

    // Reference to your Firebase project and the database
    var database = firebase.database();

    var vividness_value = document.getElementById('vividnessSlider').value;

    // Data to save
    var Value = {
    username: "newUser",
    email: "newuser@example.com",
    profile_picture: "newUserProfilePic.jpg",
    vividness: vividness_value
    };

    // Creating a unique key for each user
    var userId = firebase.database().ref().child('users').push().key;

    // Writing data to the specified user's ID under the users collection
    firebase.database().ref('users/' + userId).set(userData, function(error) {
    if (error) {
        // The write failed...
        console.log("Data could not be saved." + error);
    } else {
        // Data saved successfully!
        console.log("Data saved successfully.");
    }
    });
    



  });

  // Listen for criteria button changes
  document.getElementById('VividnessButton').addEventListener('click', function () {
    displayPdf('vividness');
  });

  document.getElementById('OriginalButton').addEventListener('click', function () {
    displayPdf('original');
  });

  document.getElementById('TransformButton').addEventListener('click', function () {
    displayPdf('transform');
  });


  // });
  
});

function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  container.innerHTML = `<img src="${imageData.specific ? imageData.specific : imageData.original}" alt="Image" width="400" height="400"> <img src="${imageData.original}" alt="Image" width="400" height="400">`;
}


//function to display grading criteria
function displayPdf(sliderName) {
  const pdfUrls = {
    vividness: './grading_criteria/vividness.pdf', 
    original: './grading_criteria/originality.pdf', 
    transform: './grading_criteria/transfromation.pdf' 
  };

  console.log(pdfUrls);

  const pdfContainer = document.getElementById("pdfContainer") || createPdfContainer();
  pdfContainer.innerHTML = `<iframe src="${pdfUrls[sliderName]}" style="width:700px; height:1000px;" frameborder="0"></iframe>`;
  console.log('pdf updated')
}

// Helper function to create a container for the PDF if it doesn't already exist
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
  document.getElementById('vividnessSlider').value = 3;
  document.getElementById('originalSlider').value = 3;
  document.getElementById('transformSlider').value = 3;
}

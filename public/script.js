document.addEventListener("DOMContentLoaded", function() {
  let imagePaths = [];
  let currentIndex = 0;

  console.log('Script started.'); 

  fetch('/api/images')
      .then(response => response.json())
      .then(data => {
          imagePaths = data;
          displayImage(imagePaths[currentIndex]);
      });




  document.getElementById('nextImage').addEventListener('click', function () {


    currentIndex = (currentIndex + 1) % imagePaths.length;
    displayImage(imagePaths[currentIndex]);

    resetSliders();

    // var vividness = document.getElementById('vividnessSlider').value;
    // var original = document.getElementById('originalSlider').value;
    // var transform = document.getElementById('transformSlider').value;

    // console.log('value get');
  
    // // Send the data to the server using the Fetch API
    // fetch('/api/submit-slider-values', {
    //   method: 'POST', // Using POST method for sending data
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ vividness: vividness, original: original, transform: transform }),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    //   // Optionally, you can reset the sliders here if needed or handle any UI updates
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });
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


});

function resetSliders() {
  document.getElementById('vividnessSlider').value = 3; // Resetting the slider to the middle value
  document.getElementById('originalSlider').value = 3; // Resetting the slider to the middle value
  document.getElementById('transformSlider').value = 3; // Resetting the slider to the middle value
}


function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  console.log("image" + imageData.original);
  const specificImageSrc = imageData.specific ? imageData.specific : imageData.original; 
  container.innerHTML = `<img src="${specificImageSrc}" alt="Image" width="400" height="400"> <img src="${imageData.original}" alt="Image" width="400" height="400">`;
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

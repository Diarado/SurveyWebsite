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

    console.log('clicked');

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


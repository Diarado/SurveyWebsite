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

  document.getElementById("nextImage").addEventListener("click", function() {
      currentIndex = (currentIndex + 1) % imagePaths.length;
      displayImage(imagePaths[currentIndex]);
  });
});

document.getElementById('nextImage').addEventListener('click', function () {

  var vividness = document.getElementById('vividnessSlider').value;
  var original = document.getElementById('originalSlider').value;
  var transform = document.getElementById('transformSlider').value;

  sendDataToServer(vividness, original, transform);

  document.getElementById('vividnessSlider').value = 50;
  document.getElementById('originalSlider').value = 50;
  document.getElementById('transformSlider').value = 50;
});


function sendDataToServer(vividness, original, transform) {
  var dataToSend = {
    vividness: vividness,
    original: original,
    transform: transform
  };

  fetch('/submit-slider-values', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', data_saving_error);
    });
}


function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  console.log("image" + imageData.original);
  const specificImageSrc = imageData.specific ? imageData.specific : imageData.original; 
  container.innerHTML = `<img src="${specificImageSrc}" alt="Image" width="400" height="400"> <img src="${imageData.original}" alt="Image" width="400" height="400">`;
}


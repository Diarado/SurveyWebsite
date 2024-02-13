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
      if (currentIndex < imagePaths.length - 1) {
          currentIndex++;
          displayImage(imagePaths[currentIndex]);
      } else {
          showThankYouMessage();
      }
  });
});

function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  container.innerHTML = `<img src="${imageData.specific ? imageData.specific : imageData.original}" alt="Image" width="400" height="400"> <img src="${imageData.original}" alt="Image" width="400" height="400">`;
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

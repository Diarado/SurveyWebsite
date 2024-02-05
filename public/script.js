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

function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  console.log("image" + imageData.original);
  const specificImageSrc = imageData.specific ? imageData.specific : imageData.original; // Use specific image if available
  container.innerHTML = `<img src="${specificImageSrc}" alt="Image"> <img src="${imageData.original}" alt="Image">`;
}

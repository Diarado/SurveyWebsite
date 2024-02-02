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

function displayImage(imagePath) {
  const container = document.getElementById("imageContainer");
  container.innerHTML = `<img src="${imagePath}" alt="Image">`;
}

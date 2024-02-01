document.addEventListener("DOMContentLoaded", function() {
  const imagePaths = generateImagePaths();
  let currentIndex = 0;

  displayImage(imagePaths[currentIndex]);

  document.getElementById("nextImage").addEventListener("click", function() {
      currentIndex = (currentIndex + 1) % imagePaths.length;
      displayImage(imagePaths[currentIndex]);
  });
});

function generateImagePaths() {
  const folders = ["VE1_4", "VE2_4", "VE3_4", "VE4_4", "VE5_4", "VE6_4", "VE7_4"];
  let images = [];

  // Assuming each folder has 20 images named 1.jpg to 20.jpg
  for (let folder of folders) {
      for (let i = 1; i <= 20; i++) {
          images.push(`${folder}/${i}.jpg`);
      }
  }

  // Shuffle the images array to display in random order
  images = shuffleArray(images);
  return images;
}

function displayImage(imagePath) {
  const container = document.getElementById("imageContainer");
  container.innerHTML = `
      <div class="image-item">
          <img src="${imagePath}" alt="Image">
          <div class="score-buttons">
              <button onclick="scoreImage(1)">Like</button>
              <button onclick="scoreImage(-1)">Dislike</button>
          </div>
      </div>
  `;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function scoreImage(score) {
  // Implement scoring logic here
  // For now, just log to the console
  console.log(`Image scored: ${score}`);
}

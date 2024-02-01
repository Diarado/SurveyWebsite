document.addEventListener("DOMContentLoaded", function() {
  const images = ["image1.jpg", "image2.jpg", "image3.jpg"]; // add images
  const container = document.getElementById("imageContainer");

  images.forEach((image, index) => {
      const imageElement = document.createElement("div");
      imageElement.className = "image-item";
      imageElement.innerHTML = `
          <img src="imgs/${image}" alt="Image ${index + 1}">
          <div class="score-buttons">
              <button onclick="scoreImage(${index}, 1)">Like</button>
              <button onclick="scoreImage(${index}, -1)">Dislike</button>
          </div>
      `;
      container.appendChild(imageElement);
  });
});

function scoreImage(imageIndex, score) {
  // TODO: Implement scoring logic here
  // now, it just log to the console
  console.log(`Image ${imageIndex + 1} scored: ${score}`);
}

document.addEventListener("DOMContentLoaded", function () {
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
      // resetSliders();
    } else {
      showThankYouMessage();
    }


  });

  // Listen for criteria button changes
  ['VividnessButton', 'OriginalButton', 'TransformButton'].forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', function () {
      const criterion = buttonId.replace('Button', '').toLowerCase();
      console.log(criterion);
      displayPdf(criterion);
    });
  });
});

function displayImage(imageData) {
  const container = document.getElementById("imageContainer");
  container.innerHTML =
    `<img src="${imageData.specific || imageData.original}" alt="Specific Image" style="width:50%; height:auto;">` +
    `<img src="${imageData.original}" alt="Original Image" style="width:50%; height:auto;">` +
    `<div class="title">${"Title: " + imageData.title || 'placeholder'}</div>`;
  console.log('title: ' + imageData.title);
}


function displayPdf(sliderName) {
  const pdfUrls = {
    vividness: './grading_criteria/vividness.pdf',
    original: './grading_criteria/originality.pdf',
    transform: './grading_criteria/transformation.pdf'
  };

  const pdfContainer = document.getElementById("pdfContainer") || createPdfContainer();
  pdfContainer.innerHTML = `<iframe src="${pdfUrls[sliderName]}" style="width:100%; height:100%;" frameborder="0"></iframe>`;
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

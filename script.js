// script.js
console.log("script");

// used to load image from <input> and draw to canvas
const img = new Image(); 

// canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

//buttons
var buttons = document.getElementById("button-group");
var b_reset = buttons.querySelector("button[type=reset]");
var b_button = buttons.querySelector("button[type=button]");
var b_submit = document.querySelector("button[type=submit]");
var voices;
var drop_down;

function populateDropDown(){
  voices = speechSynthesis.getVoices();
  drop_down = document.getElementById("voice-selection");
  drop_down.disabled = false;

  // set voices to the dropdown list
  var default_voice;

  if (voices.length !== 0){
    drop_down.remove(0);
  }
  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
      default_voice = voices[i].default;
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}

// set the voices to the dropdown
populateDropDown();
speechSynthesis.onvoiceschanged = () => {
  populateDropDown();
};


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  // clear the canvas  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //when the button b is clicked, toggle other buttons
  b_submit.onclick = function(){
    b_reset.disabled = false;
    b_button.disabled = false;
  };

  // color the canvas black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw the uploaded image
  var dim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

});


const image_input = document.getElementById('image-input');
image_input.addEventListener('change', () => {

  //get the image input
  img.src = window.URL.createObjectURL(image_input.files[0]);  

  //set the alt text
  var file = image_input.files[0];
  img.alt = file.name;
});

const sub = document.getElementById('generate-meme');
sub.addEventListener('submit', (e) => {
  e.preventDefault();

  const top_text = document.getElementById('text-top').value;
  ctx.fillStyle = "white";
  ctx.font = "small-caps bolder 25px Times New Roman";
  ctx.textAlign = "center";
  ctx.fillText(top_text, canvas.width/2, 20);

  const bottom_text = document.getElementById('text-bottom').value;
  
  //fill the bottom text
  ctx.fillText(bottom_text, canvas.width/2, canvas.height - 10);

  // toggle relevant buttons
  b_submit.disabled = true;
  b_reset.disabled = false;
  b_button.disabled = false;


});

b_reset.onclick = function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  b_submit.disabled = false;
  b_reset.disabled = true;
  b_button.disabled = true;
  document.getElementById('image-input').value = "";

}

b_button.onclick = function(){
  const top_text = document.getElementById('text-top').value;
  const bottom_text = document.getElementById('text-bottom').value;
  let top_script = new SpeechSynthesisUtterance(top_text);
  let bottom_script = new SpeechSynthesisUtterance(bottom_text);

  
  // when a voice is selected from the drop down
  var selectedOption = drop_down.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      top_script.voice = voices[i];
      bottom_script.voice = voices[i];
    }
  }

  var vol_group = document.getElementById("volume-group");
  var image = vol_group.getElementsByTagName("img");
  var volume_input = vol_group.getElementsByTagName("input");

 
  top_script.volume =  volume_input[0].value/100;
  bottom_script.volume = volume_input[0].value/100;

  
  if (volume_input[0].value >= 67 && volume_input[0].value <= 100){
    image[0].src = "icons/volume-level-3.svg";
    image[0].alt = "Volume Level 3";
  }
  else if (volume_input[0].value >= 34 && volume_input[0].value <= 66) {
    image[0].src = "icons/volume-level-2.svg";
    image[0].alt = "Volume Level 2";
  }
  else if (volume_input[0].value >= 1 && volume_input[0].value <= 33) {
    image[0].src = "icons/volume-level-1.svg";
    image[0].alt = "Volume Level 1";
  }
  else if (volume_input[0].value == 0){
    image[0].src = "icons/volume-level-0.svg";
    image[0].alt = "Volume Level 0";
  }

  speechSynthesis.speak(top_script);
  speechSynthesis.speak(bottom_script);
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

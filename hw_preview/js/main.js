const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const enumerateButton = document.getElementById('enumerateButton');
const startButton = document.getElementById('startButton');
const enableHwPreview = document.getElementById('hw_preview');

let stream;
let result = false;
let error = '';


const selectors = [videoSelect];

startButton.addEventListener('click', start);
enumerateButton.addEventListener('click', function() {navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);});

function setHwPreview() {
  enableHwPreview.checked = !enableHwPreview.checked;
}


function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      console.log("video device: ", deviceInfo);
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
    result = true;
}

function handleError(e) {
    message.innerText=e.message;
    error=e.message;
    result = false;
}

async function start() {
    if (stream) {
        stream.getTracks().forEach(track => {
        track.stop();
        });
    }
    try {
        console.log("start")
        const videoSource = videoSelect.value;
        constraints = { video: { deviceId: videoSource ? {exact: videoSource} : undefined, width: {min: 640, ideal: 1280}, height: {min: 480, ideal: 720} }, hwPreview: {ideal: enableHwPreview.checked} }
        stream = await navigator.mediaDevices.getUserMedia(constraints); //constraints
        message.innerText="getUserMedia with constraints: " + JSON.stringify(constraints);
        gotStream(stream);
    } catch (e) {
        handleError(e);
    }
}

function getResult() {
    return result;
}

function getError() {
    return error;
}
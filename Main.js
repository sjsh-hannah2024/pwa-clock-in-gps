let action = '';

function startProcess(selectedAction) {
    action = selectedAction;
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

function handleQRCode(hasQRCode) {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'block';

    if (hasQRCode) {
        startQRCodeDetection();
    } else {
        document.getElementById('selectLocation').style.display = 'block';
    }

    document.getElementById('inputName').style.display = 'block';
    if (action === 'clock-out') {
        document.getElementById('inputDetails').style.display = 'block';
    }
}

function startQRCodeDetection() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.BarcodeDetector) {
        alert("Your device does not support the Barcode Detection API.");
    } else {
        launchBarcodeScanner();
    }
}

async function launchBarcodeScanner() {
    let video = document.getElementById('barcode-detection-video');
    let stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"}});
    video.srcObject = stream;
    video.style.display = "block";
    video.play();

    let barcodeDetector = new BarcodeDetector({formats: ["qr_code"] });

    video.addEventListener('loadedmetadata', async function(){
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let context = canvas.getContext('2d');

        let checkForQrCode = async function(){
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            let barcodes = await barcodeDetector.detect(canvas);

            if (barcodes.length > 0) {
                let barcodeData = barcodes[0].rawValue;
                alert("QR code detected: " + barcodeData);
                // Handle detected QR code data
            }

            requestAnimationFrame(checkForQrCode);
        };

        checkForQrCode();
    });
}

function finalize() {
    const name = document.getElementById('nameInput').value;
    const location = document.getElementById('locationSelect').value;
    const role = document.getElementById('roleInput') ? document.getElementById('roleInput').value : '';
    const breakDuration = document.getElementById('breakInput') ? document.getElementById('breakInput').value : '';
    const earlyFinish = document.getElementById('earlyFinishInput') ? document.getElementById('earlyFinishInput').value : '';

    const data = {
        action,
        name,
        location,
        role,
        breakDuration,
        earlyFinish
    };

    console.log("Submission Data:", data);
    // Handle submission, such as saving locally or sending to server
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

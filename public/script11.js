
    const ROI_X = 250;
    const ROI_Y = 150;
    const ROI_WIDTH = 240;
    const ROI_HEIGHT = 180;
    
    const FPS = 25;
    
    let cameraStream = null;
    let processingStream = null;
    let mediaRecorder = null;
    let mediaChunks = null;
    let processingPreviewIntervalId = null;

    function processFrame() {
        let cameraPreview = document.getElementById("video-grid");
        
        processingPreview
            .getContext('2d')
            .drawImage(cameraPreview, ROI_X, ROI_Y, ROI_WIDTH, ROI_HEIGHT, 0, 0, ROI_WIDTH, ROI_HEIGHT);
    }
    
    function generateRecordingPreview() {
        let mediaBlob = new Blob(mediaChunks, { type: "video/webm" });
        let mediaBlobUrl = URL.createObjectURL(mediaBlob);
        
        let recordingPreview = document.getElementById("recordingPreview");
        recordingPreview.src = mediaBlobUrl;

        let downloadButton = document.getElementById("downloadButton");
        downloadButton.href = mediaBlobUrl;
        downloadButton.download = "RecordedVideo.webm";
    }
        
    function startCapture() {
        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            cameraStream = stream;
            
            let processingPreview = document.getElementById("processingPreview");
            processingStream = processingPreview.captureStream(FPS);
            
            mediaRecorder = new MediaRecorder(processingStream);
            mediaChunks = []
            
            mediaRecorder.ondataavailable = function(event) {
                mediaChunks.push(event.data);
                if(mediaRecorder.state == "inactive") {
                    generateRecordingPreview();
                }
            };
            
            mediaRecorder.start();
            
            let cameraPreview = document.getElementById("video-grid");
            cameraPreview.srcObject = stream;
        
            processingPreviewIntervalId = setInterval(processFrame, 1000 / FPS);
        })
        .catch((err) => {
            alert("No media device found!");
        });
    };
    
    function stopCapture() {
        if(cameraStream != null) {
            cameraStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        
        if(processingStream != null) {
            processingStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        
        if(mediaRecorder != null) {
            if(mediaRecorder.state == "recording") {
                mediaRecorder.stop();
            }
        }
        
        if(processingPreviewIntervalId != null) {
            clearInterval(processingPreviewIntervalId);
            processingPreviewIntervalId = null;
        }
    };
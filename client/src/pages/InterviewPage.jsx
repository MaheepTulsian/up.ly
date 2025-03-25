import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import RecordRTC from 'recordrtc';

const InterviewPage = () => {
    const [isMicOn, setIsMicOn] = useState(false); // Start with mic off
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef(null);
    
    // Audio recording refs
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const inactivityTimerRef = useRef(null);
    const lastActivityRef = useRef(null);

    useEffect(() => {
        // Request camera access when component mounts
        if (isCameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Fix video orientation
                        videoRef.current.style.transform = 'scaleX(-1)';
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                });
        }

        // Clean up function
        return () => {
            // Stop any ongoing recording when component unmounts
            if (recorderRef.current) {
                stopRecording();
            }
        };
    }, [isCameraOn]);

    const toggleMic = async () => {
        const newMicState = !isMicOn;
        setIsMicOn(newMicState);
        
        if (newMicState) {
            // Mic turned on - start recording
            try {
                await startRecording();
            } catch (err) {
                console.error("Error starting recording:", err);
                setIsMicOn(false); // Reset state if failed
            }
        } else {
            // Mic turned off - stop recording
            stopRecording();
        }
    };

    const startRecording = async () => {
        try {
            // Get audio stream
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Start recording
            recorderRef.current = new RecordRTC(streamRef.current, {
                type: 'audio',
                mimeType: 'audio/wav',
                recorderType: RecordRTC.StereoAudioRecorder,
                numberOfAudioChannels: 1
            });

            recorderRef.current.startRecording();
            setIsRecording(true);
            console.log("Recording started...");

            // Initialize last activity time
            lastActivityRef.current = Date.now();
            
            // Start monitoring for inactivity
            startInactivityTimer();
        } catch (err) {
            console.error("Error setting up audio recording:", err);
            throw err;
        }
    };

    const startInactivityTimer = () => {
        // Clear any existing timer
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Set up new timer to check every 5 seconds
        inactivityTimerRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            // If no activity for 10 seconds, stop recording
            if (timeSinceLastActivity > 10000) {
                if (isMicOn && recorderRef.current) {
                    stopRecording();
                    setIsMicOn(false);
                }
            }
        }, 5000);
    };

    const stopRecording = () => {
        if (!recorderRef.current) return;
        
        console.log("Stopping recording...");
        
        // Clear inactivity timer
        if (inactivityTimerRef.current) {
            clearInterval(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
        
        recorderRef.current.stopRecording(() => {
            let blob = recorderRef.current.getBlob();

            // Generate filename with timestamp
            let timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
            let filename = `interview_audio_${timestamp}.wav`;

            // Download file
            let link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            
            recorderRef.current = null;
            streamRef.current = null;
            lastActivityRef.current = null;
            
            setIsRecording(false);
        });
    };

    const toggleCamera = () => {
        setIsCameraOn(!isCameraOn);
        if (videoRef.current) {
            if (!isCameraOn) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        videoRef.current.srcObject = stream;
                        videoRef.current.style.transform = 'scaleX(-1)';
                    })
                    .catch(err => {
                        console.error("Error accessing camera:", err);
                    });
            } else {
                const stream = videoRef.current.srcObject;
                stream?.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    };

    const endCall = () => {
        // Stop recording if active
        if (recorderRef.current) {
            stopRecording();
            setIsMicOn(false);
        }
        
        // Stop video
        if (videoRef.current) {
            const stream = videoRef.current.srcObject;
            stream?.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Update last activity time when user speaks
    const updateLastActivity = () => {
        if (isMicOn && lastActivityRef.current) {
            lastActivityRef.current = Date.now();
        }
    };

    // Add event listener for audio input
    useEffect(() => {
        if (isMicOn && streamRef.current) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(streamRef.current);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            const checkAudioLevel = () => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

                // If volume is above threshold, update last activity
                if (volume > 10) {
                    updateLastActivity();
                }

                if (isMicOn) {
                    requestAnimationFrame(checkAudioLevel);
                }
            };

            checkAudioLevel();
        }
    }, [isMicOn]);

    return (
        <div className="flex flex-col h-full bg-gray-900 overflow-hidden">
            {/* Main content area with even padding */}
            <div className="flex-1 flex items-center justify-center px-8 pt-8 pb-4">
                <div className="grid grid-cols-2 gap-6 w-full h-[calc(100vh-130px)]">
                    {/* Your video */}
                    <div className="relative bg-gray-800 rounded-xl overflow-hidden h-full flex items-center justify-center shadow-lg">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                        />
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                                    <span className="text-2xl text-gray-400">You</span>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-white text-sm">
                                    Camera Off
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-white text-sm">
                            You {!isMicOn && '(Muted)'}
                        </div>
                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-white text-sm">Recording</span>
                            </div>
                        )}
                    </div>

                    {/* Other participant (placeholder) */}
                    <div className="relative bg-gray-800 rounded-xl overflow-hidden h-full flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <svg
                                className="w-32 h-32 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-white text-sm">
                            Interviewer
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="h-24 flex items-center justify-center gap-8 bg-gray-800 px-6">
                <button
                    onClick={toggleMic}
                    className={`p-5 rounded-full ${
                        isMicOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                    } text-white transition-colors shadow-md ${isRecording ? 'animate-pulse' : ''}`}
                >
                    {isMicOn ? <Mic size={26} /> : <MicOff size={26} />}
                </button>
                <button
                    onClick={toggleCamera}
                    className={`p-5 rounded-full ${
                        isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors shadow-md`}
                >
                    {isCameraOn ? <Video size={26} /> : <VideoOff size={26} />}
                </button>
                <button
                    onClick={endCall}
                    className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
                >
                    <PhoneOff size={26} />
                </button>
            </div>
        </div>
    );
};

export default InterviewPage; 
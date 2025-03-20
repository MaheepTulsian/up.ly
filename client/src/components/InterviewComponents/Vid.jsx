import React, { useEffect, useRef } from 'react';

const Vid = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const constraints = {
      video: { facingMode: 'user' }, // Use 'user' for front camera
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
    </div>
  );
}

export default Vid;

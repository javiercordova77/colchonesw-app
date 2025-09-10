// === frontend/src/Scanner.jsx ===
import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

function Scanner({ onDetect }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    scannerRef.current = new QrScanner(videoRef.current, (result) => {
      onDetect(result.data);
      scannerRef.current.stop();
    });
    scannerRef.current.start();

    return () => {
      scannerRef.current?.stop();
    };
  }, []);

  return (
    <div>
      <p>Escanea el código QR del producto:</p>
      <video ref={videoRef} style={{ width: '100%' }} />
    </div>
  );
}

export default Scanner;
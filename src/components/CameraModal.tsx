import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não disponível neste navegador');
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isOpen) {
        newStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(void 0);
          }
        });
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      let errorMessage = "Erro desconhecido ao acessar a câmera";
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = "Permissão negada para acessar a câmera";
            break;
          case 'NotFoundError':
            errorMessage = "Câmera não encontrada";
            break;
          case 'NotReadableError':
            errorMessage = "Câmera em uso por outro aplicativo";
            break;
          case 'OverconstrainedError':
            errorMessage = "Configurações de câmera não suportadas";
            break;
          default:
            errorMessage = err.message || "Falha ao alocar recurso de vídeo";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stopCamera, isOpen]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `capture-${Date.now()}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          onCapture(file);
          handleClose();
        }
      }, 'image/png');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Tirar Foto</DialogTitle>
        </DialogHeader>
        <div className="camera-modal">
          {error ? (
            <div className="camera-error">
              <p>Erro ao acessar a câmera: {error}</p>
              <Button variant="default" onClick={startCamera}>Tentar Novamente</Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="camera-feed" />
              {isLoading && (
                <div className="camera-loading">
                  <p>Carregando câmera...</p>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-controls">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSwitchCamera} disabled={isLoading || !!error}>
              Trocar Câmera
            </Button>
            <Button variant="default" onClick={handleCapture} disabled={isLoading || !!error}>
              Capturar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;

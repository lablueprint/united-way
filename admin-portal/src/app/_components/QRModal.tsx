'use client';
import '../_styles/QRModal.css';
import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import NextImage from 'next/image';
import exit from '../../../public/QRModal/close.svg';

interface ModalProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
}

export default function QRModal({ isOpen, eventId, onClose }: ModalProps) {
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [animationClass, setAnimationClass] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setAnimationClass('fadeIn');
    } else {
      setAnimationClass('fadeOut');
      const timeout = setTimeout(() => setShouldRender(false), 300); // match animation duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const downloadAsJPG = () => {
    const svg = qrWrapperRef.current?.querySelector('svg');
    if (!svg) return;

    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const jpgData = canvas.toDataURL('image/jpeg', 1.0);
      const a = document.createElement('a');
      a.href = jpgData;
      a.download = 'qr-code.jpg';
      a.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const copyQR = async () => {
    const svg = qrWrapperRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    if (copied) {
        setCopied(false);
        return;
      }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/svg+xml': blob }),
      ]);
      setCopied(true);
    } catch (error) {
      alert('Copy failed: ' + error);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`modalOverlay ${animationClass}`} onClick={onClose}>
      <div
        className={`modalContainer ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="headerContainer">
          <div className="headerWrap">
            <p className="headerText">View QR Code</p>
            <p className="headerDescription">For attendees to check in to event</p>
          </div>
          <div className="exit" onClick={onClose}>
            <NextImage src={exit} width={28} alt="Close" />
          </div>
        </div>

        <div className="qrContain" ref={qrWrapperRef}>
          <QRCode value={eventId} />
        </div>

        <div className="buttonContainer">
          <button className="lightButton noBorder" onClick={copyQR}>{copied ? 'Copied' : 'Copy'}</button>
          <button className="darkButton" onClick={downloadAsJPG}>Download</button>
        </div>
      </div>
    </div>
  );
}

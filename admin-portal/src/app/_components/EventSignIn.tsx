"use client"
import "./EventSignIn.css";
import React from 'react';
import QRCode from 'react-qr-code';

interface EventDetailsProps {
  _id: string;
}
export default function EventDetailsPage({_id }:EventDetailsProps) {
  return (
    <div className="qr-code-align">
      <QRCode value={_id}/>
    </div>
  );
}

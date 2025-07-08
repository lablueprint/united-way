import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import '../../_styles/EventActivities.css';

interface AnnouncementContentProps {
    content: { text: string }[];
}

export default function AnnouncementContent({ content }: AnnouncementContentProps) {
    const truncateText = (text: string): string => {
        return text.length > 40 ? text.slice(0, 40) + '...' : text;
    }

    return (
        <div className="announcement-content">
            {content.map((item, index) => (
                <div key={index} className="announcement-text">
                    {truncateText(item.text)}
                </div>
            ))}
        </div>
    );
}
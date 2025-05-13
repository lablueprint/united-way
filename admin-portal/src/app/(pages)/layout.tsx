"use client"
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import NavigationBar from '../_components/NavBar';

export default function PagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const dispatch = useDispatch();
    const router = useRouter();

    return (
        <html lang="en">
            <body>
                <NavigationBar></NavigationBar>
                {children}
            </body>
        </html>
    );
}

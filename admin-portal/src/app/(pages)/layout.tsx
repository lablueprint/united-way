"use client"
import React from 'react';
import NavigationBar from '../_components/NavBar';

export default function PagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div>
            <NavigationBar></NavigationBar>
            {children}
        </div>
    );
}

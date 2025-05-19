"use client"
import React from 'react';
import NavigationBar from '../_components/NavBar';
import Footer from '../_components/Footer';

export default function PagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div>
            <NavigationBar />
            {children}
            <Footer />
        </div>
    );
}

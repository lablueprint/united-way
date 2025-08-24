"use client"
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { login } from '../../_utils/redux/orgSlice';

export default function PagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [signedIn, setSignedIn] = useState(false);

    // If the user is not signed in, they shouldn't be able to
    // access any of the contents for the website.
    useEffect(() => {
        const attemptSignIn = async () => {
            const storedOrg = localStorage.getItem('org');
            if (storedOrg != null) {
                const parsedOrg = JSON.parse(storedOrg);
                dispatch(login({
                    orgId: parsedOrg.orgId,
                    authToken: parsedOrg.authToken,
                    refreshToken: parsedOrg.refreshToken
                }));
                setSignedIn(true);
            } else {
                router.push("/")
            }
        };
        attemptSignIn();
    }, []);

    return (
        <div style={{ width: "100%", height: "100%" }}>
    
            {signedIn ? children : <></>}
        </div>
    );
}

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../_styles/NavBar.css';
import Image from 'next/image'

export default function NavigationBar() {
    const router = useRouter();

    return (
        <div className={styles.body}>
            <div className={styles.leftContainer}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/uwlogo.svg"
                        width={149}
                        height={40.02}
                        alt="UW Logo"
                    />
                </div>
                <div className={styles.tabContainer}>
                    <button className={styles.tabHeader} onClick={() => { router.push('/landing'); }}>Home</button>
                    <button className={styles.tabHeader} onClick={() => { router.push('/events'); }}>Events</button>
                    <button className={styles.tabHeader} onClick={() => { router.push('/rewards'); }}>Rewards</button>
                </div>
            </div>
            <div className={styles.rightContainer}>
                <button className={styles.tabHeader} onClick={() => { router.push('/profile'); }}> 
                    <Image
                        src="/profilelogo.svg"
                        width={32}
                        height={32}
                        alt="UW Logo"
                    />
                </button>
            </div>
        </div>
    )
}

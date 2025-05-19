import React from 'react';
import styles from '../_styles/HomePage.module.css';

export default function HomePage() {







    return (
        <div className={styles.body}>
            <div className={styles.mainContainer}>
                <div className={styles.leftHalfContainer}>
                    <div className={styles.welcomeCard}>
                        <div className={styles.welcomeCardHeader}>
                            Welcome, Joy
                        </div>
                    </div>
                    <div className={styles.leftHeading}>
                        Events Happening Now
                    </div>
                    <div className={styles.eventContainer}>
                        {[...Array(4)].map((_, idx) => (
                            <div key={idx} className={styles.event}>
                                Event {idx + 1}
                            </div>
                        ))}
                    </div>
                    <div className={styles.leftHeading}>
                        Your Upcoming events
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterBox}>
                            <div className={styles.filterHeading}>
                                FILTER BY DATE
                            </div>
                            <button className={styles.filterButton}>
                                <div className={styles.filterButtonText}>
                                    DEC 28 - JAN 4
                                </div>
                            </button>
                            <div className={styles.filterHeading}>
                                VIEW
                            </div>
                            <button className={styles.filterButton2}>
                                <div className={styles.filterButtonText}>
                                    LIST
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className={styles.eventList}>
                         {[...Array(4)].map((_, idx) => (
                            <div key={idx} className={styles.event2}>
                                Event {idx + 1}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.rightHalfContainer}>
                    <div className={styles.taskContainer}>
                        <div className={styles.headerContainer}>
                            <div className={styles.taskHeader}>
                                YOUR TASKS
                            </div>
                        </div>
                    </div>
                    <div className={styles.extraInfoContainer}>
                        <div className={styles.extraInfo}>
                            <div className={styles.extraInfoHeader}>
                                Drafts
                            </div>
                        </div>
                        <div className={styles.extraInfo}>
                            <div className={styles.extraInfoHeader}>
                                Your Past Events
                            </div>
                        </div>  
                        <div className={styles.extraInfo}>
                            <div className={styles.extraInfoHeader}>
                                Your Rewards Inventory
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


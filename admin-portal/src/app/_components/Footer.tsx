import React from "react";
import Link from "next/link";
import '../_styles/Footer.css';

export default function Footer() {
    return (
        <div style={{
            padding: 80,
            display: "flex",
            flexDirection: "column"
        }}>
            { /* Pertinent Information */}
            <div className="sectionA">
                <div className="sectionA1">
                    <p className="orgHeader">
                        United Way of<br />Greater Los Angeles
                    </p>
                    <p className="sectionHeader">
                        Creating L.A.&apos;s FUTURE TOGETHER
                    </p>
                </div>
                <div className="sectionA2">
                    <p className="sectionHeader">
                        CONTACT US
                    </p>
                    <p className="sectionContent">
                        515 S. Figueroa St., Suite 900
                        Los Angeles, CA 90071
                    </p>
                </div>
                <div className="sectionA3">
                    <div>
                        <p className="sectionHeader">
                            QUICK LINKS
                        </p>
                    </div>
                    <div className="sectionContent">
                        <div>
                            <Link href="/landing">
                                HOME
                            </Link>
                        </div>
                        <div>
                            <Link href="/events">
                                EVENTS
                            </Link>
                        </div>
                        <div>
                            <Link href="/rewards">
                                REWARDS
                            </Link>
                        </div>
                        <div>
                            <Link href="/profile">
                                PROFILE
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            { /* Divider*/}
            <div className="sectionB" />

            { /* Organization information */}
            <div className="sectionC subtitle">
                <p>
                    ©2024 United Way of Greater Los Angeles
                </p>
                <p>
                    United Way of Greater Los Angeles is a 501(c)(3) Non Profit organization EIN # 95-2274801
                </p>
            </div>
        </div >
    );
}
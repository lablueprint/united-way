import React, { useState, useEffect, MouseEvent } from 'react';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';
import Image from 'next/image'
import calendar from '../_styles/_images/calendar_today.svg';
import clock from '../_styles/_images/alarm.svg';
import pencil from '../_styles/_images/border_color.svg';
import publish from '../_styles/_images/publish.svg';
import location from '../_styles/_images/location_on.svg';
import trophy from '../_styles/_images/trophy.svg';
import '../_styles/TaskList.css';

export default function TaskList() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginLeft: "6.9rem" }}> 
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ fontFamily: "Helvetica", fontSize: "1rem", color: "#18147c", fontWeight: "400", display: "flex" }}>
                    DRAFTS
                </div>
                <div style={{ backgroundColor: "#e8ecf4", color: "#18147c", width: "1.5rem", height: "1.8rem", fontWeight: "bold", borderRadius: "0.25rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    4
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ fontFamily: "Barlow", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", textAlign: "center" }}>
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.75rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.625rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        LOS ANGELES, CA
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={calendar} alt="Calendar icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Add a start date
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ fontFamily: "Barlow", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", textAlign: "center" }}>
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.75rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.625rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        LOS ANGELES, CA
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={clock} alt="Alarm icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Add a start and finish time
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={location} alt="Location icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Add a location
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={publish} alt="Publish icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Publish
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ fontFamily: "Barlow", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", textAlign: "center" }}>
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.75rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.625rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        LOS ANGELES, CA
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Add a title
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={pencil} alt="Pencil icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Upload a poster and flyer
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ fontFamily: "Barlow", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", textAlign: "center" }}>
                        MENTORSHIP PROGRAM 2025
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.75rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        MAY 3  |  4:30 - 7:30 PM
                    </div>
                    <div style={{ fontFamily: "Barlow-Normal", display: "flex", color: "#18147c", fontWeight: "600", fontSize: "1.25rem", }}>
                        •
                    </div>
                    <div style={{ fontFamily: "Inter", fontSize: "0.625rem", fontWeight: "400", color: "#18147c", display: "flex", marginTop: "0.2rem", marginBottom: "0.2rem", textAlign: "center", alignSelf: "self-end", }}>
                        LOS ANGELES, CA
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", }}>
                    <div style={{ display: "flex", objectFit: "contain", alignSelf: "stretch", }}>
                        <Image src={trophy} alt="Trophy icon" width={19} height={22} />
                    </div>
                    <div style={{ fontFamily: "Helvetica", fontSize: "1.18rem", color: "#18147C", fontWeight: "400", }}>
                        Add rewards
                    </div>
                </div>
            </div>
        </div>
    );
}
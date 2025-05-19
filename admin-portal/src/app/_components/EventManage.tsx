import { useState } from "react";
import React from "react";
import '../_styles/Header.css';
import addIcon from '../_styles/_images/add-icon.svg';
import Image from "next/image";

interface EventManageProps {
    headerText?: string;
    headerDescription?: string;
    button?: React.ReactNode;
    // onClick?: () => void; //optional function with no args
    breadcrumb?: React.ReactNode;
}

export default function EventManage( { headerText, headerDescription, button, breadcrumb }: EventManageProps) {
    return (
        <div className="hero">    
            <div className="heroInfoWrap">
                <div className="heroBreadcrumb">
                    {breadcrumb}
                </div>  
                <div className="heroInfo">
                    <div className="heroHeader">
                        <h1 className="heroHeaderText">{headerText}</h1>
                        <p className="heroDescriptionText">{headerDescription}</p>
                    </div>
                    {button && (
                        <div className="button">
                            {button}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
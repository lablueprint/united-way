import React from "react";
import Image from 'next/image';
import '../_styles/FeatureCard.css';

interface FeatureCardProps {
    image?: string,
    title: string,
    description: string[]
}

export default function FeatureCard({ image, title, description }: FeatureCardProps){
    return(
        <div className='feature-container'>
            <div className='img-container'>
                {image && <Image src={image} alt="Feature description image" />}
            </div>
            <div className='feature-content'>
                <h1 className="feature-title">{title}</h1>
                <div className="description-container">
                    {description.map((paragraph, i) => (
                        <p key={i} className="feature-descr">{paragraph}</p>
                    ))}
                </div>               
            </div>
        </div>
    );
}
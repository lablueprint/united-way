"use client";
import { useRouter } from 'next/navigation';
import { useState} from 'react';
import "./tabs.css" 
export default function Tabs() {
    const [featureState, setFeatureState] = useState(0);
    const [title, setTitle] = useState("Feature Overview 1");
    const [subtitle, setSubtitle] = useState("Lorem ipsum dolor sit amet consectetur. Eget aliquam in nulla nisi. Faucibus metus amet tortor egestas consectetur varius tellus. Scelerisque condimentum quis.");
    
    const router = useRouter();

    const handleSkip = async () => {
        router.push('/landing');
    }
    const handleContinue = async () => {
        if (featureState == 0)
        {
            setTitle("Feature Overview 2");
            setSubtitle("Another subtitle");
            setFeatureState(1);
        }
        if (featureState == 1)
        {
            router.push('/landing');
        }
    }
    return (
        <div className="split-container">
          <div className="left-panel">
            <h1 className="heading">{title}</h1>
            <p className="paragraph">
              {subtitle}
            </p>
            <button className = "continueButton" onClick={handleContinue} >Continue</button>
            <button className = "skipButton" onClick={handleSkip}>Skip</button>
            {/* Add more content here */}
          </div>
          <div className="right-panel">{/* This is intentionally left empty as a gray box */}</div>
        </div>
      )
}
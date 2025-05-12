"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FeatureCard from '@/app/_components/FeatureCard';
import styles from "./page.module.css"
import { uwLogo, Pages } from '../../../../public/onboarding/onboarding-index'

import Image from 'next/image';

// Features and functions
// Features: Home, Events, CreateEvents, Rewards
// Functions: 
//  Home: Overview, Features, Quick Actions

enum FeatureState {
  FEATURE_ONE,   // 0
  FEATURE_TWO,   // 1
  FEATURE_THREE, // 2
  FEATURE_FOUR,  // 3
  FEATURE_FIVE   // 4
}

export default function Tabs() {
  const [featureState, setFeatureState] = useState(FeatureState.FEATURE_ONE);
  const [title, setTitle] = useState("Home");
  const subtitle = "Onboarding";
  const [pageInfo, setPageInfo] = useState(Pages.Home);

  const router = useRouter();

  const handleSkip = async () => {
    router.push('/landing');
  }

  const handleContinue = async () => {
    if (featureState == FeatureState.FEATURE_ONE) {
      setTitle("Events");
      setPageInfo(Pages.Events);
      setFeatureState(1);
    }
    else if (featureState == FeatureState.FEATURE_TWO) {
      setTitle("Create Event");
      setPageInfo(Pages.CreateEvent);
      setFeatureState(2);
    }
    else if (featureState == FeatureState.FEATURE_THREE) {
      setTitle("Rewards");
      setPageInfo(Pages.Rewards);
      setFeatureState(3);
    }
    else if (featureState == FeatureState.FEATURE_FOUR) {
      setTitle("Profile");
      setPageInfo(Pages.Profile);
      setFeatureState(4);
      router.push('/landing');
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src={uwLogo} height={40} width={40} alt="United Way Logo" />
          </div>
          <h1 className={styles.logoName}>United Way</h1>
        </div>
        <div className={styles.content}>
          <h2 className={styles.pageSubheading}>{subtitle}</h2>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.features}>
            {Object.values(pageInfo).map((feature, i) => (
              <FeatureCard
                key={i}
                image={feature.image}
                title={feature.title}
                description={feature.description} />
            ))}
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.skipButton} onClick={handleSkip}>Skip</button>
          <button className={styles.continueButton} onClick={handleContinue}>Next</button>
        </div>
      </div >
    </div >
  )
}
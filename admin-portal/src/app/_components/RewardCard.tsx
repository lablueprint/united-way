"use client";

import React from "react";
import { Reward } from "./RewardsSection";
import "../_styles/rewardCard.css";
import { RootState } from "../_interfaces/AuthInterfaces";
import { useSelector } from "react-redux";
import axios from "axios";
import Image from "next/image";

// Example reward for demonstration
interface RewardCardProps {
  reward: Reward;
}

const RewardCard = ({ reward }: RewardCardProps) => {
  // Fake inventory for demonstration
  const inventory = 60; // out of 100
  const inventoryMax = 100;
  const inventoryPercent = (inventory / inventoryMax) * 100;

  const org = useSelector((state: RootState) => {
    return {
      orgId: state.auth.orgId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken,
    };
  });

  return (
    <div className="reward-container">
      <div className="reward-image">
        {reward.image ? (
          <Image
            src={reward.image}
            alt={reward.name}
            fill
            sizes="(max-width: 600px) 100vw, 15rem"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
      </div>
      <div className="reward-details">
        <div className="reward-title">{reward.name}</div>
        <div className="reward-redeemed">
          <span style={{ color: "green", fontSize: "1.1em" }}>●</span>
          <span style={{ fontStyle: "italic", marginLeft: 6 }}>
            Redeemed: 10 out of 70
          </span>
        </div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Points</div>
        <div className="reward-value">★ {reward.cost} POINTS</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Events Assigned To</div>
        <div className="reward-value">3</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Inventory</div>
        <div className="reward-value">60 left</div>
        <div className="inventory-bar-container">
          <div
            className="inventory-bar"
            style={{ width: `${(60 / 70) * 100}%` }}
          />
        </div>
      </div>
      <div className="reward-actions">
        {/* Place your icons here */}
        <span>✏️</span>
        <span>👁️</span>
        <span>🗑️</span>
      </div>
    </div>
  );
};

export default RewardCard;

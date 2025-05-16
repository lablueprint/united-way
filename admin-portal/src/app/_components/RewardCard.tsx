"use client";

import React from "react";
import { Reward } from "./RewardsSection";
import "../_styles/rewardCard.css";
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

  return (
    <div className="reward-container">
      <div className="reward-image">
        {reward.image ? (
          <Image
            src={reward.image}
            alt={reward.name}
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: "8px" }}
            unoptimized
          />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
      </div>
      <div className="reward-details">
        <div className="reward-title">{reward.name}</div>
        <div className="reward-redeemed">
          <span className="green-dot">●</span>
          <span className="redeemed-text">Redeemed: 10 out of 70</span>
        </div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Points</div>
        <div className="reward-value">★ {reward.cost} POINTS</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Events Assigned</div>
        <div className="reward-value">3</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Inventory</div>
        <div className="reward-value">60 left</div>
        <div className="inventory-bar-container">
          <div
            className="inventory-bar"
            style={
              {
                "--inventory-width": `${(inventoryPercent / 70) * 100}%`,
              } as React.CSSProperties
            }
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

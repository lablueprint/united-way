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
  // Use schema values for inventory and events
  const inventory = reward.quantity;
  const inventoryMax = reward.quantity;
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
        {/* Additional fields from schema */}
        <div className="reward-section">
          <div className="reward-label">Description</div>
          <div className="reward-value">{reward.description}</div>
        </div>
        <div className="reward-section">
          <div className="reward-label">Directions</div>
          <div className="reward-value">{reward.directions}</div>
        </div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Points</div>
        <div className="reward-value">★ {reward.cost} POINTS</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Events Assigned</div>
        <div className="reward-value">{reward.assignedEvents.length}</div>
      </div>
      <div className="reward-section">
        <div className="reward-label">Inventory</div>
        <div className="reward-value">{reward.quantity} left</div>
        <div className="inventory-bar-container">
          <div
            className="inventory-bar"
            style={
              { "--inventory-width": `${inventoryPercent}%` } as React.CSSProperties
            }
          />
        </div>
      </div>
      <div className="reward-actions">
        <span title="Edit">✏️</span>
        <span title="View Details">👁️</span>
        <span title="Delete">🗑️</span>
      </div>
    </div>
  );
};

export default RewardCard;

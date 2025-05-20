"use client";

import React from "react";
import { Reward } from "./RewardsSection";
import "../_styles/rewardCard.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Temporary Transaction type based on TransactionCard usage
interface Transaction {
  _id: string;
  user: string;
  reward: { _id: string; name: string; cost: number };
}

// Example reward for demonstration
interface RewardCardProps {
  reward: Reward;
  transactions: Transaction[];
  onDelete: (rewardId: string) => Promise<void>;
}

const RewardCard = ({ reward, transactions, onDelete }: RewardCardProps) => {
  // Use schema values for inventory and events
  const inventory = reward.quantity;
  const inventoryMax = reward.quantity;
  const inventoryPercent = (inventory / inventoryMax) * 100;
  const router = useRouter();
  // Calculate redeemed count for this reward
  const redeemedCount = transactions.filter(
    (t) => t.reward && t.reward._id === reward._id
  ).length;
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
        {reward.assignedEvents && reward.assignedEvents.length > 0 ? (
          <div className="reward-redeemed">
            <span className="green-dot">●</span>
            <span className="redeemed-text">
              Redeemed: {redeemedCount} out of {reward.quantity}
            </span>
          </div>
        ) : (
          <div className="reward-unassigned">
            <span className="blue-dot">●</span>
            Assign to an event
          </div>
        )}
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
              {
                "--inventory-width": `${inventoryPercent}%`,
              } as React.CSSProperties
            }
          />
        </div>
      </div>
      <div className="reward-actions">
        <button
          onClick={() => router.push(`/rewards/edit/${reward._id}`)}
          title="Edit"
          className="action-button"
        >
          <Image
            src="/rewardsAssets/edit.svg"
            alt="Edit"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
        </button>
        <span title="View Details">
          <Image
            src="/rewardsAssets/view.svg"
            alt="View"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
        </span>
        <button
          onClick={() => onDelete(reward._id)}
          title="Delete"
          className="delete-button action-button"
        >
          <Image
            src="/rewardsAssets/delete.svg"
            alt="Delete"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
        </button>
      </div>
    </div>
  );
};

export default RewardCard;

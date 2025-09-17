"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../_styles/rewardsComponent.css";
//new changes for the RewardCreator.tsx
import { useRouter } from "next/navigation";
import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";
import RewardCard from "./RewardCard";

export interface Reward {
  name: string;
  image: string;
  cost: number;
  quantity: number;
  description: string;
  directions: string;
  assignedEvents: string[];
  _id: string;
}

// Temporary Transaction type based on TransactionCard usage
interface Transaction {
  _id: string;
  user: string;
  reward: { _id: string; name: string; cost: number };
  isClaimed: boolean;
}

const RewardsSection = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortType, setSortType] = useState<
    "points" | "inventory" | "status" | null
  >(null);
  const router = useRouter();
  const [org, sendRequest] = useApiAuth();

  // Select primitive values to avoid object dependency changes

  const getSortedRewards = () => {
    if (!sortType) return rewards;

    return [...rewards].sort((a, b) => {
      switch (sortType) {
        case "points":
          return b.cost - a.cost;
        case "inventory":
          return b.quantity - a.quantity;
        case "status":
          return b.assignedEvents.length - a.assignedEvents.length;
        default:
          return 0;
      }
    });
  };

  const handleSort = (type: "points" | "inventory" | "status") => {
    setSortType(sortType === type ? null : type);
  };

  const deleteReward = async (rewardId: string) => {
    // try {
    //   const updatedRewards = rewards.filter(
    //     (reward) => reward._id !== rewardId
    //   );
    //   const response = await axios.patch(
    //     `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/orgs/${orgId}`,
    //     {
    //       rewards: updatedRewards,
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${org.authToken}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    const updatedRewards = rewards.filter(
      (reward) => reward._id !== rewardId
    );
    const endpoint = `orgs/${org.orgId}`;
    const body = {
      rewards: updatedRewards,
    }
    const requestType = RequestType.PATCH;
    const data = await sendRequest({ requestType, body, endpoint });
    setRewards(updatedRewards);
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const endpoint = `orgs/${org.orgId}`;
        const body = {};
        const requestType = RequestType.GET;
        const data = await sendRequest({ requestType, body, endpoint });
        setRewards(data.rewards || []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error(
            "Fetch failed:",
            err.response?.status,
            err.response?.data
          );
        } else {
          console.error(err);
        }
      }
    };
    const fetchTransactions = async () => {
      try {
        const endpoint = "transactions/organization/:id";
        const body = {};
        const requestType = RequestType.GET;
        const data = await sendRequest({ requestType, body, endpoint });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRewards();
    fetchTransactions();
  }, [org.orgId]);

  return (
    <div className="rewards-container">
      <div className="hero-container">
        <div className="hero-logo-container">
          <div className="hero-logo"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">

            <div className="hero-title">
              REWARDS
            </div>
            <div className="hero-subtitle">
              View and edit your rewards.
            </div>

          </div>
          <div className="hero-button-container">
            <div className="hero-button" onClick={() => router.push("/rewards/create")}>
              + CREATE REWARDS
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-container">
        <div className="statistics-section">
          <h2 className="statistics-title">STATISTICS</h2>
          <hr className="statistics-divider" />
          <div className="statistics-bar">
            <div className="stat-block">
              <div className="stat-title">Assigned Rewards</div>
              <div className="stat-row">
                <span className="stat-value">
                  {
                    rewards.filter((reward) => reward.assignedEvents.length > 0)
                      .length
                  }
                </span>
                <span className="stat-label">assigned</span>
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-title">Unassigned Rewards</div>
              <div className="stat-row">
                <span className="stat-value">
                  {
                    rewards.filter(
                      (reward) => reward.assignedEvents.length === 0
                    ).length
                  }
                </span>
                <span className="stat-label">unassigned</span>
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-title">Redeemed Rewards</div>
              <div className="stat-row">
                <span className="stat-value">{transactions.length}</span>
                <span className="stat-label">redeemed</span>
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-title">Claimed Rewards</div>
              <div className="stat-row">
                <span className="stat-value">
                  {transactions.filter((t) => t.isClaimed).length}
                </span>
                <span className="stat-label">claimed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter/Sort Section */}
      <div className="filter-section">
        <div className="filter-label">Sort by</div>
        <button
          className={`filter-btn ${sortType === "points" ? "active" : ""}`}
          onClick={() => handleSort("points")}
        >
          Points
        </button>
        <button
          className={`filter-btn ${sortType === "inventory" ? "active" : ""}`}
          onClick={() => handleSort("inventory")}
        >
          Inventory
        </button>
        <button
          className={`filter-btn ${sortType === "status" ? "active" : ""}`}
          onClick={() => handleSort("status")}
        >
          Status
        </button>
      </div>

      <div className="rewards-section">
        {getSortedRewards().map((reward) => (
          <RewardCard
            key={reward._id}
            reward={reward}
            transactions={transactions}
            onDelete={deleteReward}
          />
        ))}
      </div>
    </div>
  );
};

export default RewardsSection;

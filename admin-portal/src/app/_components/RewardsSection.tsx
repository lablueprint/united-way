"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../_styles/rewardsComponent.css";
import axios, { AxiosResponse } from "axios";
import { RootState } from "../_interfaces/AuthInterfaces";
//new changes for the CreateReward.tsx
import { useRouter } from "next/navigation";
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

const RewardsSection = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  // Select primitive values to avoid object dependency changes
  const orgId = useSelector((state: RootState) => state.auth.orgId);
  const authToken = useSelector((state: RootState) => state.auth.authToken);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const url = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${orgId}`;
        console.log("This is the URL: ", url);
        const currOrg: AxiosResponse = await axios.get(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setRewards(currOrg.data.data.rewards || []);
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
    fetchRewards();
  }, [refreshTrigger, orgId]);

  const deleteReward = async (rewardId: string) => {
    try {
      const updatedRewards = rewards.filter(
        (reward) => reward._id !== rewardId
      );
      const response = await axios.patch(
        `http://${process.env.NEXT_PUBLIC_IP_ADDRESS}:${process.env.NEXT_PUBLIC_PORT}/orgs/${orgId}`,
        {
          rewards: updatedRewards,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status === "success") {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to delete reward:", error);
    }
  };

  const addReward = async (newReward: Reward) => {
    try {
      console.log("Redux auth state:", orgId, authToken);
      console.log("Auth token:", authToken);
      const response = await axios.patch(
        `http://${process.env.NEXT_PUBLIC_IP_ADDRESS}:${process.env.NEXT_PUBLIC_PORT}/orgs/${orgId}`,
        {
          rewards: [...rewards, newReward],
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status === "success") {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to add reward:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (newRewardName.trim() && newRewardCost) {
    //   addReward({
    //     name: newRewardName.trim(),
    //     cost: parseFloat(newRewardCost),
    //     quantity: parseFloat(newRewardQuantity),
    //   });
    // }
  };

  return (
    <div className="rewards-container">
      <div className="rewards-image">
        <img src="/home-banner.svg" alt="Rewards" className="rewards-image" />
        <div className="rewards-header">
          <h1 className="rewards-title">Rewards</h1>
          <p className="rewards-description">View and edit your rewards.</p>
        </div>
        <button
          className="floating-add-button sleek-add-button"
          onClick={() => router.push("/rewards/create")}
        >
          + CREATE REWARDS
        </button>
      </div>

      <div className="rewards-section">
        {rewards.map((reward) => (
          <RewardCard key={reward._id} reward={reward} />
        ))}
      </div>
    </div>
  );
};

export default RewardsSection;

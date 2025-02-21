import React, { useState } from 'react';

interface RewardsSectionProps {
    rewards: string[];
    onAdd: (reward: string) => void;
    onDelete: (reward: string) => void;
}

export interface Reward {
    name: string;
    cost: number;
    _id: string;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards, onAdd, onDelete }) => {
    const [newRewardName, setNewRewardName] = useState("");
    const [newRewardCost, setNewRewardCost] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRewardName.trim() && newRewardCost) {
            onAdd({
                name: newRewardName.trim(),
                cost: parseFloat(newRewardCost),
            });
            setNewRewardName("");
            setNewRewardCost("");
        }
    }

    return (
        <div>
            <h2>Rewards</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={newRewardName} 
                    onChange={(e) => setNewRewardName(e.target.value)}
                    placeholder="Enter reward name"
                />
                <input 
                    type="number" 
                    value={newRewardCost} 
                    onChange={(e) => setNewRewardCost(e.target.value)}
                    placeholder="Enter reward cost"
                />
                <button type="submit">Add Reward</button>
            </form>
            <ul>
                {rewards.map((reward) => (
                    <li key={reward._id}>
                        {reward.name} - Cost: {reward.cost}
                        <button onClick={() => onDelete(reward._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RewardsSection;
import React, { useState } from 'react';

interface RewardsSectionProps {
    rewards: string[];
    onAdd: (reward: string) => void;
    onDelete: (reward: string) => void;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards, onAdd, onDelete }) => {
    const [newReward, setNewReward] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReward.trim()) {
            onAdd(newReward.trim());
            setNewReward("");
        }
    }

    return (
        <div>
            <h2>Rewards</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    value={newReward} 
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="Enter new reward"
                />
                <button type="submit">Add Reward</button>
            </form>
            <ul>
                {rewards.map((reward, index) => (
                    <li key={index}>
                        {reward}
                        <button onClick={() => onDelete(reward)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RewardsSection;

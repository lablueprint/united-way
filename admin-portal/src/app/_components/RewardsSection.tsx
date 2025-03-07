import React, { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import '../_styles/rewards.css';
import axios, { AxiosResponse } from 'axios';

export interface Reward {
    name: string;
    cost: number;
    quantity: number;
    _id: string;
}

export const RewardsSection = () => {
    const [newRewardName, setNewRewardName] = useState('');
    const [newRewardCost, setNewRewardCost] = useState('');
    const [newRewardQuantity, setNewRewardQuantity] = useState('');

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchRewards = async () => {
        try{
    const currOrg: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`);
                console.log(currOrg.data.data);
                setRewards(currOrg.data.data.rewards || []);
    }
    catch (err) {
        console.log(err);
    }
}
fetchRewards();
}, [refreshTrigger]);

const addReward = async (newReward: Reward) => {
    try {
        const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
            rewards: [...rewards, newReward]
        });
        if (response.data.status === "success") {
            setRefreshTrigger(prev => prev + 1);
        }
    } catch (error) {
        console.error("Failed to add reward:", error);
    }
}
const deleteReward = async (rewardId: string) => {
    const updatedRewards = rewards.filter(reward => reward._id !== rewardId);
    try {
        const response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/679c716717aa28c4bef0ef9c`, {
            rewards: updatedRewards
        });
        if (response.data.status === "success") {
            setRefreshTrigger(prev => prev + 1);
        }
    } catch (error) {
        console.error("Failed to delete reward:", error);
    }
}

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRewardName.trim() && newRewardCost) {
            addReward({
                name: newRewardName.trim(),
                cost: parseFloat(newRewardCost),
                quantity: parseFloat(newRewardQuantity),
            });
            setNewRewardName('');
            setNewRewardCost('');
            setNewRewardQuantity('');
            setIsModalOpen(false);
        }
    };

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
    };

    return (
        <div className="container">
            <h2 className="title">Rewards</h2>
            {rewards.length != 0 ? (<Slider {...settings} className="carousel">
                {rewards.map((reward) => (
                    <div key={reward._id} className="reward-card">
                        <h3>{reward.name}</h3>
                        <p>Cost: {reward.cost}</p>
                        <p>Quantity: {reward.quantity}</p>
                        <button onClick={() => deleteReward(reward._id)} className="delete-button">Delete</button>
                    </div>
                ))}
                <div className="add-card" onClick={() => setIsModalOpen(true)}>
                    <span className="plus-sign">+</span>
                </div>
            </Slider>) : (<div className="add-card" onClick={() => setIsModalOpen(true)}>
                    <span className="plus-sign">+</span>
                </div>)}
            

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Reward</h3>
                        <form onSubmit={handleSubmit}>
                            <label>Reward Name</label>
                            <input 
                                type="text" 
                                value={newRewardName} 
                                onChange={(e) => setNewRewardName(e.target.value)} 
                                placeholder="Enter reward name"
                            />
                            <label>Reward Cost</label>
                            <input 
                                type="number" 
                                value={newRewardCost} 
                                onChange={(e) => setNewRewardCost(e.target.value)} 
                                placeholder="Enter reward cost"
                            />
                            <label>Reward Quantity</label>
                            <input 
                                type="number" 
                                value={newRewardQuantity} 
                                onChange={(e) => setNewRewardQuantity(e.target.value)} 
                                placeholder="Enter reward cost"
                            />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-button">Cancel</button>
                                <button type="submit" className="submit-button">Add Reward</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardsSection;

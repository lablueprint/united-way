// import React, { useState } from 'react';

// interface RewardsSectionProps {
//     rewards: string[];
//     onAdd: (reward: string) => void;
//     onDelete: (reward: string) => void;
// }

// export interface Reward {
//     name: string;
//     cost: number;
//     _id: string;
// }

// export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards, onAdd, onDelete }) => {
//     const [newRewardName, setNewRewardName] = useState("");
//     const [newRewardCost, setNewRewardCost] = useState("");

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (newRewardName.trim() && newRewardCost) {
//             onAdd({
//                 name: newRewardName.trim(),
//                 cost: parseFloat(r_cost),
//             });
//             setNewRewardName("");
//             setNewRewardCost("");
//         }
//     }

//     return (
//         <div>
//             <h2>Rewards</h2>
//             <form onSubmit={handleSubmit}>
//                 <input 
//                     type="text" 
//                     value={newRewardName} 
//                     onChange={(e) => setNewRewardName(e.target.value)}
//                     placeholder="Enter reward name"
//                 />
//                 <input 
//                     type="number" 
//                     value={newRewardCost} 
//                     onChange={(e) => setNewRewardCost(e.target.value)}
//                     placeholder="Enter reward cost"
//                 />
//                 <button type="submit">Add Reward</button>
//             </form>
//             <ul>
//                 {rewards.map((reward) => (
//                     <li key={reward._id}>
//                         {reward.name} - Cost: {reward.cost}
//                         <button onClick={() => onDelete(reward._id)}>Delete</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default RewardsSection;
import React, { useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import '../_styles/rewards.css';

interface RewardsSectionProps {
    rewards: Reward[];
    onAdd: (reward: Reward) => void;
    onDelete: (id: string) => void;
}

export interface Reward {
    name: string;
    cost: number;
    quantity: number;
    _id: string;
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards, onAdd, onDelete }) => {
    const [newRewardName, setNewRewardName] = useState('');
    const [newRewardCost, setNewRewardCost] = useState('');
    const [newRewardQuantity, setNewRewardQuantity] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRewardName.trim() && newRewardCost) {
            onAdd({
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
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div className="container">
            <h2 className="title">Rewards</h2>
            <Slider {...settings} className="carousel">
                {rewards.map((reward) => (
                    <div key={reward._id} className="reward-card">
                        <h3>{reward.name}</h3>
                        <p>Cost: {reward.cost}</p>
                        <p>Quantity: {reward.quantity}</p>
                        <button onClick={() => onDelete(reward._id)} className="delete-button">Delete</button>
                    </div>
                ))}
                <div className="add-card" onClick={() => setIsModalOpen(true)}>
                    <span className="plus-sign">+</span>
                </div>
            </Slider>

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

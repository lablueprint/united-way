import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import "../_styles/transactions.css";

const TransactionsCard = () => {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/transactions/`);
                console.log(response.data);
                setTransactions(response.data)
                console.log(response.data)
            } catch (err) {
                console.error(err);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div>
            
        <div className="table-container">
            <table className="table">
                <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Name </th>
                    <th>Reward to Redeem</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(transaction => (
                <tr key={transaction._id}>
                    <td>User {transaction.user}</td>
                    <td>Reward: {transaction.reward.name}</td>
                    <td>Cost: {transaction.reward.cost}</td>
                </tr>
            ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

export default TransactionsCard;
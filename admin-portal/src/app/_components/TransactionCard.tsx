import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/transactions.css";

interface TransactionData {
  _id: string,
  user: string,
  reward: {
    name: string,
    cost: string,
  }
}

const TransactionsCard = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const org = useSelector((state: RootState) => {
    return {
      orgId: state.auth.orgId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken,
    };
  });
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response: AxiosResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/`
        );
        setTransactions(response.data);
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
            {transactions.map((transaction) => (
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

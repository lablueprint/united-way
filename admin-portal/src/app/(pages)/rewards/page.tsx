"use client"
// Added following line
import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import RewardsSection from "@/app/_components/RewardsSection";
import TransactionsCard from "@/app/_components/TransactionCard";

import "../../_styles/rewardsPage.css";

export default function Rewards() {
  const [responseValue, setResponseValue] = useState();

  // Example of requesting data from the database/backend and making use of the data.
  const exampleGetToRoot = async () => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/transactions/`);
      setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    } // Post request
  }

  return (
    <div>
      <div className="page-container"> 
        <div className="column-1"> <RewardsSection></RewardsSection> </div>
        <div className="column-2"> 
          <TransactionsCard></TransactionsCard>
        </div>
      </div>
      
    </div>
  );
}

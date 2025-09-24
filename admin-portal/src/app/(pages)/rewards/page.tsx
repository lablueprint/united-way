"use client";
// Added following line
import RewardsSection from "@/app/_components/RewardsSection";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";

import "../../_styles/rewardsPage.css";

export default function Rewards() {
  const [responseValue, setResponseValue] = useState();

  // Example of requesting data from the database/backend and making use of the data.
  const exampleGetToRoot = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/`
      );
      setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    } // Post request
  };

  return (
    <div>
      <div className="page-container">
        {" "}
        <RewardsSection></RewardsSection>{" "}
        {/* <div className="column-2"> 
          <TransactionsCard></TransactionsCard>
        </div> */}
      </div>
    </div>
  );
}

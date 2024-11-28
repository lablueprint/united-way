"use client"
import axios, { AxiosResponse } from "axios";

// Added following line
import EventCard from '../../_components/EventCard';
import OrganizationProfile from '../../_components/OrganizationProfile';

import { useState } from "react";
export default function Landing() {
  const [responseValue, setResponseValue] = useState();

  // Example of requesting data from the database/backend and making use of the data.
  const exampleGetToRoot = async () => {
    try {
      const response : AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/`)
      setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
        Welcome to the test landing page.
        <EventCard id={"674565d380c3def8b66fa1b7"}></EventCard>
        <OrganizationProfile></OrganizationProfile>
        
        <button onClick={() => {console.log("Result: ", exampleGetToRoot())}}>
          Example HTTP Request button
        </button>
        <div>
          Result: {responseValue}
        </div>
    </div>
  );
}

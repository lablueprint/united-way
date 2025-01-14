"use client";
import axios, { AxiosResponse } from "axios";

// Added following line
import OrganizationProfile from "../../_components/OrganizationProfile";

import { useState } from "react";
export default function Landing() {
  const [responseValue, setResponseValue] = useState();

  // Example of requesting data from the database/backend and making use of the data.
  const exampleGetToRoot = async () => {
    try {
      console.log(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/`);
      // const response: AxiosResponse = await axios.get(
      //   `http://${process.env.IP_ADDRESS}:${process.env.PORT}/`
      // );
      // setResponseValue(response.data);
    } catch (error) {
      console.log(error);
    } // Post request
  };

  return (
    <div>
      Welcome to the test landing page.
      <OrganizationProfile></OrganizationProfile>
      <button
        onClick={() => {
          console.log("Result: ", exampleGetToRoot());
        }}
      >
        Example HTTP Request button
      </button>
      <div>Result: {responseValue}</div>
    </div>
  );
}

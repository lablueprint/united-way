"use client";
import React, { useEffect } from "react";
import { useParams } from 'next/navigation';
import axios, {AxiosResponse} from "axios";
import '@/app/_styles/rewardsPage.css'
import { Reward } from "@/app/_components/RewardsSection";
import { useSelector } from "react-redux";
import { RootState } from "@/app/_interfaces/AuthInterfaces";

export default function EditRewardPage() {
  const params = useParams();
  const rewardId = params.id;
  console.log(params);
  console.log("id is", rewardId);
  const [reward, setReward] = React.useState<Reward>();
  const orgId = useSelector((state: RootState) => state.auth.orgId);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  

   useEffect(() => {
      const fetchRewardbyID = async (id: string) => {
        try {
          const url = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${orgId}/rewards/${id}`;
          console.log("This is the URL: ", url);
          const currOrg: AxiosResponse = await axios.get(url, 
            {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          });
          console.log(currOrg.data.data)
          setReward(
            {
            name: currOrg.data.data.name,
            image: "",
            cost: currOrg.data.data.cost,
            quantity: currOrg.data.data.quantity,
            _id: currOrg.data.data._id,
            description: currOrg.data.data.description,
            directions: currOrg.data.data.directions,
            }
            );
          console.log("Reward is", reward);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error(
              "Fetch failed:",
              err.response?.status,
              err.response?.data
            );
          } else {
            console.error(err);
          }
        }
      };
      fetchRewardbyID(rewardId);
    }, [rewardId, orgId]);

    useEffect(() => {
  if (reward) {
    console.log("Reward updated:", reward);
  }
}, [reward]);

return (
  !reward ? (
    <h1>Loading...</h1>
  ) : (
    <div>
      <div className="banner">
        <img src="/home-banner.svg" alt="Banner" className="banner" />
        <h1 className="bannerText">Rewards Page</h1>
      </div>

          <div className="buttonDiv"> 
            <button className="previewButton" onClick={() => {}}>
              <img src="/eye.svg" alt="preview" className="previewIcon" />
              PREVIEW</button>
            <button className="editButton" onClick={() => {}}>EDIT</button>
          </div>

        <div className="content">
          
          <div className="pageLeft">
            <div>
              Test
            </div>

          </div>

          <div className="pageRight">
            <div className="rewardTitle">{reward.name}</div>
            <h1>DESCRIPTION</h1>
            <div className="rewardDescription">{reward.description}</div>
            <h1>DIRECTIONS TO REDEEM</h1>
            <div className="rewardDirections">{reward.directions}</div>
          </div>

        </div>
    </div>
  )
);
}

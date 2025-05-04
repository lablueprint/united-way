import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/createReward.css";

const CreateReward = () => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const org = useSelector((state: RootState) => ({
    orgId: state.auth.orgId,
    authToken: state.auth.authToken,
  }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newReward = {
        name: name.trim(),
        cost: parseFloat(cost),
        quantity: parseFloat(quantity),
        image, // Add image data (optional, for future backend support)
      };
      // Fetch current rewards
      const currOrg = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`,
        {
          headers: {
            Authorization: `Bearer ${org.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const rewards = currOrg.data.data.rewards || [];
      // Add new reward
      const response = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`,
        {
          rewards: [...rewards, newReward],
        },
        {
          headers: {
            Authorization: `Bearer ${org.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status === "success") {
        setMessage("Reward created successfully!");
        setName("");
        setCost("");
        setQuantity("");
        setImage(null);
      } else {
        setMessage("Failed to create reward.");
      }
    } catch (error) {
      setMessage("Error creating reward.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="create-reward-header">
        <div className="header-left">
          <img src="/images/udub.png" alt="Logo" />
          <div className="header-nav">
            <button className="header-nav-btn">Home</button>
            <button className="header-nav-btn">Events</button>
            <button className="header-nav-btn active">Rewards</button>
          </div>
        </div>
      </div>
      <div className="create-reward-page">
        <div className="create-reward-left">
          <div className="image-upload-area">
            {image ? (
              <img
                src={image}
                alt="Reward Preview"
                style={{
                  maxWidth: "90%",
                  maxHeight: "220px",
                  borderRadius: 12,
                }}
              />
            ) : (
              <span
                style={{
                  color: "#b0b0b0",
                  fontSize: "1.1rem",
                  textAlign: "center",
                }}
              >
                Upload reward image
              </span>
            )}
            <label htmlFor="reward-image-upload">
              <input
                id="reward-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <span className="image-upload-btn">Upload Image</span>
            </label>
          </div>
        </div>
        <div className="create-reward-right">
          <form className="create-reward-form" onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                marginBottom: 16,
              }}
            >
              <button className="save-btn" type="submit">
                SAVE
              </button>
            </div>
            <label>Reward Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label>Reward Cost</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
            <label>Reward Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {message && <p>{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateReward;

import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/createReward.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CreateReward = () => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [directions, setDirections] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const org = useSelector((state: RootState) => ({
    orgId: state.auth.orgId,
    authToken: state.auth.authToken,
  }));

  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Upload the image
      const imageUrl = await uploadOrgImage(file);
      console.log("Uploaded image URL:", imageUrl);
      setImage(imageUrl);
    }
  };

  const uploadOrgImage = async (file: File) => {
    console.log("Image upload token:", org.authToken);
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post(
      `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}/addImage`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${org.authToken}`,
        },
      }
    );
    console.log("Image upload response:", response.data);
    return response.data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newReward = {
        name: name.trim(),
        cost: parseFloat(cost),
        quantity: parseFloat(quantity),
        description: description.trim(),
        directions: directions.trim(),
        image: image,
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
        setDescription("");
        setDirections("");
        setImage(null);
        setImageFile(null);
        router.push("/rewards");
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
      <div className="rewards-image">
        <img src="/home-banner.svg" alt="Rewards" className="rewards-image" />
        <div className="rewards-header">
          <h1 className="rewards-title">REWARDS</h1>
          <p className="rewards-description">View and create your rewards.</p>
        </div>
      </div>
      <div className="create-reward-page">
        <div className="create-reward-right">
          <div className="save-btn-row">
            <button
              className="cancel-btn"
              type="button"
              onClick={() => router.push("/rewards")}
            >
              CANCEL
            </button>
            <button
              className="save-btn"
              type="submit"
              form="create-reward-form"
            >
              SAVE
            </button>
          </div>
          <form
            className="create-reward-form"
            id="create-reward-form"
            onSubmit={handleSubmit}
          >
            <div className="image-upload-area">
              <label
                htmlFor="reward-image-upload"
                className="image-upload-label"
              >
                {image ? (
                  <img
                    src={image}
                    alt="Reward Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <img
                      src="/upload-icon.svg"
                      alt="Upload"
                      width={40}
                      height={40}
                    />
                    <span className="image-upload-btn">Upload images here</span>
                  </div>
                )}
                <input
                  id="reward-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div className="form-fields-col">
              <label>Reward Name</label>
              <input
                type="text"
                placeholder="TITLE"
                className="reward-title-input"
                style={{ fontSize: "1.6rem" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="form-fields-row">
                {/* Point Value Field */}
                <div className="input-group">
                  <span className="input-icon">
                    <img
                      src="/rewardsAssets/points.svg"
                      alt="Points"
                      width={22}
                      height={22}
                    />
                  </span>
                  <label className="input-label">POINT VALUE</label>
                  <input
                    type="number"
                    className="input-field"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    min={0}
                    required
                  />
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() =>
                      setCost((c) => String(Math.max(0, Number(c) - 1)))
                    }
                  >
                    -
                  </button>
                  <span className="quantity-value">{cost || 0}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setCost((c) => String(Number(c) + 1))}
                  >
                    +
                  </button>
                </div>
                {/* Inventory Field */}
                <div className="input-group">
                  <span className="input-icon">
                    <img
                      src="/rewardsAssets/inventory.svg"
                      alt="Inventory"
                      width={22}
                      height={22}
                    />
                  </span>
                  <label className="input-label">INVENTORY</label>
                  <input
                    type="number"
                    className="input-field"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={0}
                    required
                  />
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() =>
                      setQuantity((q) => String(Math.max(0, Number(q) - 1)))
                    }
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity || 0}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setQuantity((q) => String(Number(q) + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <label>DESCRIPTION</label>
              <textarea
                value={description}
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
                className="description-textarea"
              />
              <label>DIRECTIONS TO REDEEM</label>
              <textarea
                value={directions}
                placeholder="Directions to Redeem"
                onChange={(e) => setDirections(e.target.value)}
                className="directions-textarea"
              />
            </div>
          </form>
        </div>
      </div>
      {message && <p>{message}</p>}
    </>
  );
};

export default CreateReward;

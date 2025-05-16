import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../_interfaces/AuthInterfaces";
import "../_styles/createReward.css";
import { useRouter } from "next/navigation";
import Image from 'next/image';

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
      let imageUrl = image;
      // Only upload if we have a new file and no existing URL
      console.log("Image URL:", imageUrl.imageUrl);
      const newReward = {
        name: name.trim(),
        cost: parseFloat(cost),
        quantity: parseFloat(quantity),
        description: description.trim(),
        directions: directions.trim(),
        image: imageUrl.imageUrl,
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
      <div className="create-reward-page">
        <div className="create-reward-right">
          <form
            className="create-reward-form"
            id="create-reward-form"
            onSubmit={handleSubmit}
          >
            <div className="image-upload-area">
              {image ? (
                <img
                  src={image}
                  alt="Reward Preview"
                  style={{
                    maxWidth: "90%",
                    maxHeight: "160px",
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
            <div className="form-fields-col">
              <div className="form-header-row">
                <div></div>
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
              <label>Point Value</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                min={1}
              />
              <label>Quantity</label>
              <div className="quantity-row">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() =>
                    setQuantity((q) => String(Math.max(1, Number(q) - 1)))
                  }
                >
                  -
                </button>
                <span className="quantity-value">{quantity || 1}</span>
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => String(Number(q) + 1))}
                >
                  +
                </button>
              </div>
              <label>Rewards Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="description-textarea"
              />
              <label>Directions to redeem</label>
              <textarea
                value={directions}
                onChange={(e) => setDirections(e.target.value)}
                className="directions-textarea"
              />
              {message && <p>{message}</p>}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateReward;

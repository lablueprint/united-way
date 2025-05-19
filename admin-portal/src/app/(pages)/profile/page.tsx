"use client"
import React, { useState, useEffect } from 'react';
import axios from "axios";
import styles from "./page.module.css"
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../_interfaces/AuthInterfaces';
import { logout } from '../../_utils/redux/orgSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OrgDetails {
  name: string;
  email: string;
  password: string;
  community: string;
  description: string;
  dateJoined: string;
  website: string;
  instagram: string;
  facebook: string;
  phoneNumber: string;
  /* add location later */
}

interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  community?: string;
  description?: string;
  dateJoined?: string;
  website?: string;
  location?: string;
  instagram?: string;
  facebook?: string;
  phoneNumber?: string;
}


export default function Profile() {
  const dispatch = useDispatch();
  // Individual state variables for each field
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState("");
  const [description, setDescription] = useState("");
  const [dateJoined, setDateJoined] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [language, setLanguage] = useState(true);
  const [twoStep, setTwoStep] = useState(false);
  const router = useRouter();

  // State to store original data for comparison
  const [originalData, setOriginalData] = useState<OrgDetails>({
    name: "",
    email: "",
    password: "",
    community: "",
    description: "",
    dateJoined: "",
    website: "",
    instagram: "",
    facebook: "",
    phoneNumber: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);

  const org = useSelector((state: RootState) => ({
    orgId: state.auth.orgId,
    authToken: state.auth.authToken,
    refreshToken: state.auth.refreshToken
  }));

  const fetchOrgData = async () => {
    try {
      console.log(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`)
      const response = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${org.authToken}`
          }
        }
      );
      const { data } = response.data;

      // Set individual state variables
      setName(data.name || "");
      setEmail(data.email || "");
      setPassword(data.password || "");
      setCommunity(data.community || "");
      setDescription(data.description || "");
      setDateJoined(data.dateJoined || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setPhoneNumber(data.phoneNumber || "");

      // Set original data for comparison
      setOriginalData(data);
    } catch (err) {
      console.log('Error fetching org details:', err);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  // Get current state as an object for comparison with original data
  const getCurrentFormData = (): OrgDetails => {
    return {
      name,
      email,
      password,
      community,
      description,
      dateJoined,
      website,
      instagram,
      facebook,
      phoneNumber
    };
  };

  const handleSubmit = async () => {
    try {
      const currentData = getCurrentFormData();
      const updateData: UserUpdate = {};

      // Only include fields that have changed
      Object.keys(currentData).forEach(key => {
        const typedKey = key as keyof OrgDetails;
        if (currentData[typedKey] !== originalData[typedKey]) {
          updateData[typedKey] = currentData[typedKey];
        }
      });

      if (Object.keys(updateData).length === 0) {
        console.log('No changes to update');
        return;
      }

      console.log('Update data:', updateData);

      // Make the API call to update organization data
      const response = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/orgs/${org.orgId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${org.authToken}`
          }
        }
      );

      console.log('User updated successfully', response.data);
      setUpdateSuccess(true);
      setOriginalData(currentData);

    } catch (error) {
      console.error('Update failed:', error);
      setUpdateSuccess(false);

      // Reset error message after 3 seconds
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };

  return (
    <div className={styles.bod}>
      <div className={styles.body}>
        <div className={styles.bannerWrapper}>
          <Image
            src="/orgprofilebanner.svg"
            width={2661}
            height={294}
            alt="Organization Banner"
            className={styles.banner}
          />
        </div>
        <div className={styles.body2}>
          <div className={styles.mainContainer}>
            <div className={styles.topContainer}>
              <Image
                src="/orgprofilepic.svg"
                width={220}
                height={220}
                alt="Organization Logo"
              />
              <div className={styles.topTextContainer}>
                <div className={styles.orgName}>
                  {name || "Organization Name"}
                </div>
                <div className={styles.orgDetailsContainer}>
                  <div className={styles.memberSince}>
                    MEMBER SINCE
                  </div>
                  <div className={styles.joinDate}>
                    {dateJoined.split('T')[0] || "Join Date"}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className={styles.basicInfoContainer}>
              <div className={styles.basicHeader}>
                BASIC INFORMATION
              </div>
              <div className={styles.infoFormContainer}>
                <div className={styles.basicInfoHeader}>
                  ORGANIZATION NAME
                </div>
                <input
                  className={styles.inputBox}
                  name="name"
                  placeholder="Enter organization name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className={styles.infoFormContainer}>
                <div className={styles.basicInfoHeader}>
                  DESCRIPTION
                </div>
                <input
                  className={styles.inputBox}
                  name="description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className={styles.infoFormContainer}>
                <div className={styles.basicInfoHeader}>
                  LOCATION
                </div>
                <input
                  className={styles.inputBox}
                  name="community"
                  placeholder="Enter location"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                />
              </div>
              <div className={styles.doubleContainer}>
                <div className={styles.doubleContainer1}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      E-MAIL
                    </div>
                    <input
                      className={styles.inputBox}
                      name="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.doubleContainer2}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      PASSWORD
                    </div>
                    <input
                      className={styles.inputBox}
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button className={styles.button} onClick={handleSubmit}>
                <div className={styles.saveText}>
                  SAVE
                </div>
              </button>
            </div>

            {/* Contact Information Section */}
            <div className={styles.basicInfoContainer}>
              <div className={styles.basicHeader}>
                CONTACT INFORMATION
              </div>
              <div className={styles.contactHeading}>
                This information will be public and available to view on your organization page
              </div>
              <div className={styles.infoFormContainer}>
                <div className={styles.basicInfoHeader}>
                  WEBSITE
                </div>
                <input
                  className={styles.inputBox}
                  name="website"
                  placeholder="Enter website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className={styles.doubleContainer}>
                <div className={styles.doubleContainer1}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      INSTAGRAM
                    </div>
                    <input
                      className={styles.inputBox}
                      name="instagram"
                      placeholder="Enter Instagram handle"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.doubleContainer2}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      FACEBOOK
                    </div>
                    <input
                      className={styles.inputBox}
                      name="facebook"
                      placeholder="Enter Facebook page"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.doubleContainer}>
                <div className={styles.doubleContainer1}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      E-MAIL
                    </div>
                    <input
                      className={styles.inputBox}
                      name="email"
                      placeholder="Enter contact email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.doubleContainer2}>
                  <div className={styles.infoFormContainer}>
                    <div className={styles.basicInfoHeader}>
                      PHONE NUMBER
                    </div>
                    <input
                      className={styles.inputBox}
                      name="phoneNumber"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button className={styles.button} onClick={handleSubmit}>
                <div className={styles.saveText}>
                  SAVE
                </div>
              </button>
            </div>

            {/* Account Settings Section */}
            <div className={styles.settingsContainer}>
              <div className={styles.basicHeader}>
                ACCOUNT SETTINGS
              </div>
              <div className={styles.doubleContainer}>
                <div className={styles.languageContainer}>
                  <div className={styles.languageLeft}>
                    <Image
                      src="/languageicon.svg"
                      width={24}
                      height={24}
                      alt="Language"
                    />
                    <div className={styles.languageHeader}>
                      Language
                    </div>
                  </div>
                  <div className={styles.languageRight}>
                    <button className={`${language ? "" : styles.selected} ${styles.switchButton}`} onClick={() => { setLanguage(false) }}>
                      <div className={styles.switchHeading}>
                        ES
                      </div>
                    </button>
                    <button className={`${language ? styles.selected : ""} ${styles.switchButton}`} onClick={() => { setLanguage(true) }}>
                      <div className={styles.switchHeading}>
                        EN
                      </div>
                    </button>
                  </div>
                </div>
                <div className={styles.verificationContainer}>
                  <div className={styles.languageLeft}>
                    <Image
                      src="/twostep.svg"
                      width={24}
                      height={24}
                      alt="Two-step verification"
                    />
                    <div className={styles.languageHeader}>
                      2-Step Verification
                    </div>
                  </div>
                  <div className={styles.languageRight}>
                    <button className={`${twoStep ? "" : styles.selected} ${styles.switchButton}`} onClick={() => { setTwoStep(false) }}>
                      <div className={styles.switchHeading}>
                        OFF
                      </div>
                    </button>
                    <button className={`${twoStep ? styles.selected : ""} ${styles.switchButton}`} onClick={() => { setTwoStep(true) }}>
                      <div className={styles.switchHeading}>
                        ON
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <button className={styles.button} onClick={handleLogout}>
                <div className={styles.saveText}>
                  LOG OUT
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

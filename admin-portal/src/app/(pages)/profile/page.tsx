"use client"
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../_utils/redux/orgSlice';
import styles from "./page.module.css";

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

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

// TODO: Date parsing for "MEMBER SINCE"
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
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);

  const [org, sendRequest] = useApiAuth();

  const updateFields = (data: OrgDetails) => {
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
  }

  const fetchOrgData = async () => {
    try {
      const body = {};
      const requestType = RequestType.GET;
      const endpoint = "orgs/:id";
      const data = await sendRequest({ body, requestType, endpoint });
      updateFields(data);
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
    const currentData = getCurrentFormData();

    // Make the API call to update organization data
    const body = currentData;
    const requestType = RequestType.PATCH;
    const endpoint = "orgs/:id";
    const data = await sendRequest({ body, requestType, endpoint });

    if (Object.keys(data).length === 0) {
      fetchOrgData();
      setUpdateSuccess(false);
    } else {
      setUpdateSuccess(true);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.header}>
          <Image
            src="/orgprofilepic.svg"
            width={220}
            height={220}
            alt="Organization Logo"
          />
          <div className={styles.topTextContainer}>
            <div className={`heading3 ${styles.orgName}`}>
              {name || "Organization Name"}
            </div>
            <div className={`label ${styles.orgDetailsContainer}`}>
              <div className={styles.memberSince}>
                MEMBER SINCE
              </div>
              <div className={styles.joinDate}>
                {dateJoined.split('T')[0] || "XX/XX/XXXX"}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.innerContainer}>
          {/* Basic Information Section */}
          <div className={styles.basicInfoContainer}>
            <div className={styles.basicHeader}>
              BASIC INFORMATION
            </div>
            <div className={styles.infoFormContainer}>
              <div className={`label ${styles.basicInfoHeader}`}>
                ORGANIZATION NAME
              </div>
              <input
                className={`body3 ${styles.inputBox}`}
                name="name"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.infoFormContainer}>
              <div className={`label ${styles.basicInfoHeader}`}>
                DESCRIPTION
              </div>
              <input
                className={`body3 ${styles.inputBox}`}
                name="description"
                placeholder="Provide an overview of your organization"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className={styles.infoFormContainer}>
              <div className={`label ${styles.basicInfoHeader}`}>
                LOCATION
              </div>
              <input
                className={`body3 ${styles.inputBox}`}
                name="community"
                placeholder="Enter location"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
              />
            </div>
            <div className={styles.doubleContainer}>
              <div className={styles.doubleContainer1}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    E-MAIL
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.doubleContainer2}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    PASSWORD
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
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

          <div className={styles.divider} />

          {/* Contact Information Section */}
          <div className={styles.basicInfoContainer}>
            <div className={styles.basicHeader}>
              CONTACT INFORMATION
            </div>
            <div className={styles.contactHeading}>
              This information will be public and available to view on your organization page
            </div>
            <div className={styles.infoFormContainer}>
              <div className={`label ${styles.basicInfoHeader}`}>
                WEBSITE
              </div>
              <input
                className={`body3 ${styles.inputBox}`}
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className={styles.doubleContainer}>
              <div className={styles.doubleContainer1}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    INSTAGRAM
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
                    name="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.doubleContainer2}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    FACEBOOK
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
                    name="facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.doubleContainer}>
              <div className={styles.doubleContainer1}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    E-MAIL
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.doubleContainer2}>
                <div className={styles.infoFormContainer}>
                  <div className={`label ${styles.basicInfoHeader}`}>
                    PHONE NUMBER
                  </div>
                  <input
                    className={`body3 ${styles.inputBox}`}
                    name="phoneNumber"
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

          <div className={styles.divider} />

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
                <div className={styles.iconContainer}>
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
                <div className={styles.iconContainer}>
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
  );
}

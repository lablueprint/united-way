// "use client";

// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useDispatch } from 'react-redux';
// import React, { useState, useEffect, FormEvent } from 'react';
// import axios, { AxiosResponse } from "axios";
// import { login } from '../../_utils/redux/orgSlice';

// interface TwoFactorAuthProps {
//     initialEmail: string;
//   }

// export default function TwoFactorAuth({initialEmail}: TwoFactorAuthProps) {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState(initialEmail);
//   const [code, setCode] = useState("");
//   const [message, setMessage] = useState("");
//   const [hashedCode, updateHashedCode] = useState(null);
//   const router = useRouter();

//   const sendTwoFactorAuth = async () => {
//     const data = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/twofactor/verifyEmail`, { email });
//     const codeData = data.data;
//     // If no valid email was found, we return -1.
//     if (codeData === -1) {
//       console.log ("No valid email was found")
//       return;
//     }
//     updateHashedCode(codeData);
//     setStep(2);
//   };

//   const verifyCode = async () => {
//     const data = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/twofactor/verifyCode`, { code, hashedCode });
//     const match = data.data;
//     if (match) {
//         router.push('/onboarding');
//       return;
//     }
//   };


//   return (
//     <div>
//       {step === 1 ? (
//         <div>
//           <h2>Click the button to send the code to your email</h2>
//           <button onClick={sendTwoFactorAuth}>Send Code</button>
//         </div>
//       ) : (
//         <div>
//           <h2>Enter Verification Code</h2>
//           <input
//             type="text"
//             placeholder="123456"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//           />
//           <button>Verify</button>
//         </div>
//       )}
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

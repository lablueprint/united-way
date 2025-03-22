import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Link, useRouter, Redirect, useLocalSearchParams } from 'expo-router';
import axios, { AxiosResponse } from "axios";

export default function VerificationScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, authToken, email } = params;
  const [email_in, setemail_in] = useState("vanshikaturkar06@gmail.com");
  const [state, setState] = useState(0);
  const [hashedCode, setHashedCode] = useState('');

  const handle2fa = async () => {

    try {
      console.log("In try statement");
    const response: AxiosResponse = await axios.post(
      `http://192.168.86.24:4000/twofactor/sendOTP`,
      { email: email_in } // Sending email in the request body
    );
    setHashedCode(response.data)
    return response.data; // Return hashed OTP (or error message)
  } catch (err) {
    console.error('Error sending OTP:', err);
  }
  setState(1);

  }
  const next = async () => {
    try {
        const response: AxiosResponse = await axios.post(
            `http://192.168.86.24:4000/twofactor/verifyCode`,
            { 
                code: code,  // User-entered code
                hashedCode: hashedCode  // Hashed code stored in the backend
            }
        );

        if (response.data) {
            console.log("OTP Verified:", response.data);
            router.push({ pathname: "/onboarding", params: { id: response.data.data._id, authToken: response.data.authToken} });
            //return response.data;
        } else {
            console.error("Invalid OTP");
        }
        
    } catch (err) {
        console.error('Error verifying OTP:', err);
    }
    
};

  return (
    
    <View style={styles.outerContainer2fa}>
      <View style={styles.container2fa}>
        <View style={styles.content2fa}>
          <View style={styles.header2fa}>
            <Text style={styles.title2fa}>2-Step Verification</Text>
          </View>
        {/* { state != 0? 
          (<> */}
          <TextInput
            style={styles.input2fa}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="Enter verification code"
          />
          <TouchableOpacity style={styles.continueButton2fa} onPress={next}>
            <Text style={styles.continueButtonText2fa} >Continue</Text>
          </TouchableOpacity>
          {/* </>
          ) : ( */}
            <TouchableOpacity style={styles.continueButton2fa} onPress={handle2fa}>
            <Text style={styles.continueButtonText2fa} >Send Code</Text>
          </TouchableOpacity>
          {/* )
          } */}

          
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer2fa: {
      flex: 1,
      padding: 2,
      backgroundColor: '#007AFF',
    },
    container2fa: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 40,
    },
    content2fa: {
      flex: 1,
      padding: 20,
      marginTop: 40,
    },
    header2fa: {
      marginBottom: 40,
    },
    title2fa: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle2fa: {
      fontSize: 16,
      color: '#666',
    },
    input2fa: {
      backgroundColor: '#F5F5F5',
      padding: 16,
      borderRadius: 8,
      fontSize: 18,
      marginBottom: 24,
      letterSpacing: 1,
    },
    continueButton2fa: {
      backgroundColor: 'black',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    continueButtonText2fa: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

import axios from 'axios';
import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export default function UserSignUpForm() {
  const [email, onChangeEmail] = useState('');
  const [demographics, onChangeDemo] = useState('');
  const [name, onChangeName] = useState('');
  const [phoneNum, onChangePhoneNum] = useState('');
  const [community, onChangeCommunity] = useState('');

  const handleAddUser = async () => {
    onChangeEmail('');
    onChangeDemo('');
    onChangeName('');
    onChangePhoneNum('');
    onChangeCommunity('');

    const { data } = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/users/createUser`, {
      collectedStamps: [],
      demographics: {
        gender: false,
        ethnicity: "",
        community: community,
      },
      email: email,
      experiencePoints: 0,
      name: name,
      numStamps: 0,
      pastEvents: [],
      phoneNumber: phoneNum,
      registeredEvents: []
    })
  }

  return (
    <View>
      <TextInput
        placeholder="Email"
        onChangeText={onChangeEmail}
        value={email} />

      <TextInput
        placeholder="Demographics"
        onChangeText={onChangeDemo}
        value={demographics} />

      <TextInput
        placeholder="Name"
        onChangeText={onChangeName}
        value={name} />

      <TextInput
        placeholder="PhoneNum"
        onChangeText={onChangePhoneNum}
        value={phoneNum} />

      <TextInput
        placeholder="Community"
        onChangeText={onChangeCommunity}
        value={community} />

      <Button title="Hello Daniel" onPress={handleAddUser} />
    </View>
  );
}
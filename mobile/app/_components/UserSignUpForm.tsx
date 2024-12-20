import React from 'react';
import { View, Button, TextInput } from 'react-native';
import axios from 'axios';

export default function UserSignUpForm() {
  const [email, onChangeEmail] = React.useState('');
  const [demographics, onChangeDemo] = React.useState('');
  const [name, onChangeName] = React.useState('');
  const [phoneNum, onChangePhoneNum] = React.useState('');
  const [community, onChangeCommunity] = React.useState('');

  const handleAddUser = async () => {
    onChangeEmail('');
    onChangeDemo('');
    onChangeName('');
    onChangePhoneNum('');
    onChangeCommunity('');

    const { data } = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`, {
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
      points: 0,
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

      <Button title="Print" onPress={handleAddUser} />
    </View>
  );
}
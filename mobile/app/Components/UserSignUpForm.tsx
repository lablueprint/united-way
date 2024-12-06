import React from 'react';
import { View, Button, TextInput } from 'react-native';
// import axios from 'axios';
// USECLIENT TO CHANGE STATE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

interface whatever {
  onChangeUser: (email, demographics, name, phoneNum, community) => void
}

export default function UserSignUpForm ({ onChangeUser }: whatever) {

  const [email, onChangeEmail] = React.useState('');
  const [demographics, onChangeDemo] = React.useState('');
  const [name, onChangeName] = React.useState('');
  const [phoneNum, onChangePhoneNum] = React.useState('');
  const [community, onChangeCommunity] = React.useState('');

const handleAddUser = () => {
  onChangeUser(email, demographics, name, phoneNum, community);
  onChangeEmail('');
  onChangeDemo('');
  onChangeName('');
  onChangePhoneNum('');
  onChangeCommunity('');
}

  return (
    <View>
        <TextInput
        placeholder="Email"
        onChangeText={onChangeEmail}
        value={email}/>

        <TextInput
        placeholder="Demographics"
        onChangeText={onChangeDemo}
        value={demographics}/>

        <TextInput
        placeholder="Name"
        onChangeText={onChangeName}
        value={name}/>

        <TextInput
        placeholder="PhoneNum"
        onChangeText={onChangePhoneNum}
        value={phoneNum}/>

        <TextInput
        placeholder="Community"
        onChangeText={onChangeCommunity}
        value={community}/>
        
        <Button title="Print" onPress = {handleAddUser}/>
    </View>
  );
}
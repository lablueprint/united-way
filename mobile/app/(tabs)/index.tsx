import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useSelector } from "react-redux";
import UserSignUpForm from "../Components/UserSignUpForm";

const styles = StyleSheet.create({
  homeStyle: {
    padding: 5,
    backgroundColor: "#ff9600",
    marginTop: "30%",
  },
});

export default function HomeScreen() {
  // const { user, onChangeUser } = useState('');
  const [email, onChangeEmail] = React.useState("");
  const [demographics, onChangeDemo] = React.useState("");
  const [name, onChangeName] = React.useState("");
  const [phoneNum, onChangePhoneNum] = React.useState("");
  const [community, onChangeCommunity] = React.useState("");

  function onChangeUser(
    email: string,
    demographics: string,
    name: string,
    phoneNum: string,
    community: string
  ) {
    onChangeEmail(email);
    onChangeDemo(demographics);
    onChangeName(name);
    onChangePhoneNum(phoneNum);
    onChangeCommunity(community);
    console.log(
      email + " " + demographics + " " + name + " " + phoneNum + " " + community
    );
  }

  return (
    <View style={styles.homeStyle}>
      <UserSignUpForm onChangeUser={onChangeUser} />
    </View>
  );
}
/*{import { Button, TextInput } from 'react-native';
import { useState } from 'react';
import PropTypes from 'prop-types';
import UserSignUpForm from './UserSignUpForm';

export default function NewPostForm() {
  const [username, setUsername] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('');

  const handleAddPost = () => {
    // addNewPost({ username, body, tag });
    setUsername('');
    setBody('');
    setTag('');
  };

  return (
    <>
      <UserSignUpForm/>
      <TextInput
        placeholder="Who is this?"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        placeholder="What are you Printing?"
        onChangeText={setBody}
        value={body}
      />
      <TextInput
        placeholder="Enter tag"
        onChangeText={setTag}
        value={tag}
      />
      <Button title="Print" onPress={handleAddPost} />
    </>
  );
}

NewPostForm.propTypes = {
  addNewPost: PropTypes.func.isRequired,
};*/

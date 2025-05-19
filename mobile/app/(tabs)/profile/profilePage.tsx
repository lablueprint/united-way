import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Router, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '@/app/_utils/redux/userSlice';
import Loader from '@/app/_components/Loader';

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

import { Color, Typography } from '@/app/_styles/global'
import { Colors } from 'react-native/Libraries/NewAppScreen';

interface UserDetails {
    name: string,
    phoneNumber: string,
    email: string,
    password: string,
    profilePicture: string,
    dateJoined: string,
    isTemporary: boolean,
}

interface LinkInterface {
    source: number,
    title: string,
    router: Router,
    path: string
}

function LinkComponent({ source, title, router, path }: LinkInterface) {
    return (
        <View>
            <TouchableOpacity style={linkStyles.container} onPress={() => { router.push(path); }}>
                <View style={linkStyles.content}>
                    <Image source={source} style={linkStyles.linkIcon} />
                    <Text style={[Typography.body2, linkStyles.contentText]}>
                        {title}
                    </Text>
                </View>
                <Image source={require("../../../assets/images/profile/arrowRight.png")} style={linkStyles.arrowRight} />
            </TouchableOpacity>
            <View style={linkStyles.divider}></View>
        </View>
    )
}

interface ToggleInterface {
    source: number,
    title: string,
    optionA: string,
    optionB: string
    selection: boolean,
    toggle: (value: boolean) => void
}

function ToggleComponent({ source, title, optionA, optionB, selection, toggle }: ToggleInterface) {
    return (
        <View>
            <View style={toggleStyles.container}>
                <View style={linkStyles.content}>
                    <Image source={source} style={linkStyles.linkIcon} />
                    <Text style={[Typography.body2, linkStyles.contentText]}>
                        {title}
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, selection == false ? toggleStyles.selected : {}]} onPress={() => { toggle(false); }}>
                        <Text style={[Typography.body2, selection == false ? toggleStyles.selectedText : {}]}>
                            {optionA}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, selection == true ? toggleStyles.selected : {}]} onPress={() => { toggle(true); }}>
                        <Text style={[Typography.body2, selection == true ? toggleStyles.selectedText : {}]}>
                            {optionB}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={linkStyles.divider} />
        </View>
    )
}

// TODO: Edit image through the edit icon (using Expo Photo Library)
//       Enable in-app notifications
export default function Profile() {
    const [userDetails, setUserDetails] = useState<UserDetails | undefined>();
    const [lang, setLanguage] = useState(false);
    const [notif, setNotif] = useState(false);
    const [user, sendRequest] = useApiAuth();

    const dispatch = useDispatch();
    const router = useRouter();

    const dispatchLogout = async () => {
        await dispatch(logout());
    }

    const fetchUserDetails = async () => {
        try {
            const body = {};
            const endpoint = "users/:id";
            const requestType = RequestType.GET
            const data = await sendRequest({ body, endpoint, requestType })
            setUserDetails(data);
        } catch (err) {
            console.log('Error catching event details from event id:', err);
            return err;
        }
    }

    useEffect(() => {
        const patchUserDetails = async () => {
            const body = {
                preferredLanguage: lang ? "ES" : "EN"
            };
            const endpoint = "users/:id";
            const requestType = RequestType.PATCH
            const data = await sendRequest({ body, endpoint, requestType });
            setUserDetails(data);
        }
        patchUserDetails();
    }, [lang])

    useFocusEffect(useCallback(() => {
        fetchUserDetails();
    }, []));

    const navigateTo = (route: string) => {
        if (userDetails) {
            const userDetailsString = JSON.stringify(userDetails);
            const encodedDetails = encodeURIComponent(userDetailsString);
            router.push(`${route} ? details = ${encodedDetails}`);
        }
    };

    if (userDetails && userDetails.isTemporary == true) {
        return (
            <SafeAreaView style={guestStyles.container}>
                <View style={guestStyles.innerContainer}>
                    <Image
                        source={require("../../../assets/images/profile/signUp.png")}
                        style={{ width: 220, height: 151 }}
                    />
                    <View style={guestStyles.innerContent}>
                        <View>
                            <Text style={[Typography.h3, guestStyles.orgText]}>
                                UNITED WAY
                            </Text>
                            <Text style={[Typography.h3, guestStyles.contentText]}>
                                SIGN UP TODAY TO GAIN ACCESS TO YOUR PROFILE
                            </Text>
                        </View>
                        <Text style={[Typography.body2, guestStyles.bodyText]}>
                            We noticed you haven’t made an account with us yet.
                            Join us for easy rewards, event customization, profiles and
                            more!
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={guestStyles.signUpButton} onPress={() => {
                    router.push({
                        pathname: "/(onboarding)/sign-up",
                        params: { tempId: user.userId }
                    });
                }}>
                    <Text style={[Typography.h3, guestStyles.signUpText]}>
                        SIGN UP
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    if (!userDetails) {
        return <></>
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.innerContainer, styles.centerAlignColumnContainer]}>
                <Text style={[Typography.h3, styles.title]}>PROFILE</Text>
                <View style={[styles.centerAlignColumnContainer, styles.innerContainerImages]}>
                    <View style={[styles.imageContainer]}>
                        <Image
                            source={{ uri: userDetails.profilePicture }}
                            style={styles.profilePicture}
                        />
                        <Image
                            source={
                                require("../../../assets/images/profile/editProfilePicture.png")
                            }
                            style={styles.editProfilePicture}
                        />
                    </View>
                    <View style={[styles.innerContainerDetails, styles.centerAlignColumnContainer]}>
                        <Text style={[Typography.h3, styles.name]}>{userDetails.name}</Text>
                        <View style={[styles.centerAlignColumnContainer]}>
                            <Text style={styles.header1}>{"Member since"}</Text>
                            <Text style={styles.header2}>{userDetails.dateJoined.split('T')[0]}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.linkContainer}>
                <LinkComponent source={require("../../../assets/images/profile/myAccount.png")} title="My account" router={router} path="/profile/account" />
                <ToggleComponent source={require("../../../assets/images/profile/language.png")} title="Language" optionA="EN" optionB="ES" selection={lang} toggle={setLanguage} />
                <LinkComponent source={require("../../../assets/images/profile/passport.png")} title="Passport" router={router} path="/profile/passport" />
                <LinkComponent source={require("../../../assets/images/profile/contact.png")} title="Contact us" router={router} path="/profile/contact" />
                <ToggleComponent source={require("../../../assets/images/profile/notifications.png")} title="Notifications" optionA="OFF" optionB="ON" selection={notif} toggle={setNotif} />
            </View>
            <TouchableOpacity style={styles.logout} onPress={() => { dispatchLogout(); router.push("/(onboarding)") }}>
                <Text style={[Typography.button, styles.logoutText]}>
                    Log out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const guestStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        rowGap: 40,
        backgroundColor: Color.uwLightBlue
    },
    innerContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        rowGap: 64
    },
    innerContent: {
        width: "100%"
    },
    orgText: {
        fontSize: 16,
        color: Color.uwDarkBlue
    },
    contentText: {
        color: Color.uwDarkBlue,
        lineHeight: 45,
        paddingVertical: 10
    },
    bodyText: {
        color: "#10167F",
        opacity: 0.6
    },
    signUpButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Color.uwDarkBlue,
        borderRadius: 100,
        width: "100%",
        padding: 14
    },
    signUpText: {
        color: "#FFFFFF",
        fontSize: 24
    }
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rowGap: 36
    },
    linkContainer: {
        width: "100%",
        paddingHorizontal: 24,
    },
    innerContainer: {
        rowGap: 24,
    },
    innerContainerImages: {
        rowGap: 12
    },
    innerContainerDetails: {
        rowGap: 8
    },
    centerAlignColumnContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    imageContainer: {
        position: "relative"
    },
    profilePicture: {
        height: 136,
        width: 136,
        borderRadius: 68
    },
    editProfilePicture: {
        height: 37,
        width: 37,
        position: "absolute",
        right: 0,
        bottom: 0
    },
    title: {
        fontSize: 40,
        color: Color.uwDarkBlue
    },
    name: {
        fontSize: 32,
        textTransform: "uppercase",
        color: Color.uwDarkBlue
    },
    header1: {
        fontSize: 16,
        color: Color.uwDarkBlue,
        opacity: .6
    },
    header2: {
        fontSize: 16,
        color: Color.uwDarkBlue,
    },
    icon: {
    },
    blockHeading: {
        color: '#000000', // Text color
        fontSize: 10,
        textAlign: 'center',
    },
    logout: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(16, 22, 127, 0.4)",
    },
    logoutText: {
        color: Color.uwDarkBlue
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        columnGap: 2,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 3
    }
});

const linkStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        height: 44
    },
    content: {
        display: "flex",
        flexDirection: "row",
        columnGap: 12,
        alignItems: "center"
    },
    contentText: {
        color: Color.uwDarkBlue,
        opacity: 0.6
    },
    divider: {
        backgroundColor: Color.uwDarkBlue,
        opacity: 0.1,
        height: 1,
        width: "100%"
    },
    linkIcon: {
        width: 24,
        height: 24
    },
    arrowRight: {
        width: 16,
        height: 16
    }
})

const toggleStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        height: 44
    },
    contentContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 12,
    },
    contentText: {
        color: Color.uwDarkBlue,
        opacity: 0.6
    },
    buttonContainer: {
        width: 43,
        height: 27
    },
    selected: {
        backgroundColor: Color.uwDarkBlue,
    },
    selectedText: {
        color: "#FFFFFF"
    }
})
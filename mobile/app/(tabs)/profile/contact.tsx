"use client"
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Color, Typography } from '@/app/_styles/global';

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

// TODO: When the dropdown is triggered, show text content depending on selected one.
export default function Contact() {
    const router = useRouter();
    const [user, sendRequest] = useApiAuth();

    function Interactable({ source = null, title = <></>, component = <></> }) {
        return (
            <View>
                <View style={linkStyles.container}>
                    <View style={linkStyles.content}>
                        {source ? <Image source={source} style={linkStyles.linkIcon} /> : <></>}
                        {title}
                    </View>
                    {
                        component
                    }
                </View>
                <View style={linkStyles.divider} />
            </View>
        )
    }

    function Dropdown() {
        const [showContent, setShowContent] = useState(false)
        return (
            <View>
                {
                    !showContent ? (
                        <TouchableOpacity onPress={() => setShowContent(!showContent)}>
                            <Image source={require("../../../assets/images/profile/arrowDown.png")} style={styles.arrowDown} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setShowContent(!showContent)}>
                            <Image source={require("../../../assets/images/profile/arrowRight.png")} style={styles.arrowRight} />
                        </TouchableOpacity>
                    )
                }
            </View >
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backContainer} onPress={() => { router.back(); }}>
                    <Image source={require("../../../assets/images/profile/arrowLeft.png")} style={styles.arrowLeft} />
                </TouchableOpacity>
                <Text style={[Typography.h3, styles.headerText]}>CONTACT US</Text>
            </View>
            <View style={styles.innerContainer}>
                {/* Basic information */}
                <View style={styles.form}>
                    <Text style={[Typography.h3, styles.basicHeader]}>
                        BASIC INFORMATION
                    </Text>
                    <View>
                        <Interactable
                            source={require("../../../assets/images/profile/contact.png")}
                            title={
                                <Text style={[Typography.body2, linkStyles.contentText]}>
                                    EMAIL US
                                </Text>
                            }
                            component={
                                <Text style={[Typography.body2, styles.content]}>contact@organization.com</Text>
                            }
                        />
                        <Interactable
                            source={require("../../../assets/images/profile/phone.png")}
                            title={
                                <Text style={[Typography.body2, linkStyles.contentText]}>
                                    CALL US
                                </Text>
                            }
                            component={
                                <Text style={[Typography.body2, styles.content]}>(000) 000-0000</Text>
                            }
                        />
                    </View>
                </View>

                <View style={styles.form}>
                    <Text style={[Typography.h3, styles.basicHeader]}>
                        FAQ
                    </Text>
                    <View>
                        <Interactable
                            title={
                                <Text style={[Typography.body2, linkStyles.faqText]}>
                                    What is United Way?
                                </Text>
                            }
                            component={
                                <Dropdown />
                            }
                        />
                        <Interactable
                            title={
                                <Text style={[Typography.body2, linkStyles.faqText]}>
                                    How can I redeem rewards?
                                </Text>
                            }
                            component={
                                <Dropdown />
                            }
                        />
                        <Interactable
                            title={
                                <Text style={[Typography.body2, linkStyles.faqText]}>
                                    How can I reach out to organizations?
                                </Text>
                            }
                            component={
                                <Dropdown />
                            }
                        />
                        <Interactable
                            title={
                                <Text style={[Typography.body2, linkStyles.faqText]}>
                                    Terms and Conditions
                                </Text>
                            }
                            component={
                                <Dropdown />
                            }
                        />
                    </View>
                </View>

                <Interactable
                    title={
                        <Text style={[Typography.body2, linkStyles.faqText]}>
                            How can I support?
                        </Text>
                    }
                    component={
                        <Dropdown />
                    }
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: "100%",
        height: '100%',
        backgroundColor: "#FFFFFF",
        rowGap: 44
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginHorizontal: 24,
    },
    headerText: {
        fontSize: 36,
        color: Color.uwDarkBlue, // Primary color
    },
    backContainer: {
        position: "absolute",
        left: 0,
    },
    arrowLeft: {
        width: 24, // Size of the picture
        height: 24, // Size of the picture
    },
    arrowDown: {
        width: 16,
        height: 16,
    },
    arrowRight: {
        width: 16,
        height: 16
    },
    divider: {
        height: 1,
        width: "100%",
        backgroundColor: Color.uwDarkBlue,
        opacity: 0.2,
    },
    innerContainer: {
        display: "flex",
        flexDirection: "column",
        rowGap: 48,
        marginHorizontal: 24,

    },
    fieldContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        rowGap: 4
    },
    pictureButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: "wrap",
        height: '90%',
        marginBottom: 0,
    },
    basicHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Color.uwDarkBlue,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        rowGap: 20,
    },
    formContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: '#FFFFFF', // White background for the form
        borderRadius: 5,
        padding: 5,
        rowGap: 12
    },
    label: {
        fontSize: 13,
        marginBottom: 5,
        color: Color.uwDarkBlue,
        fontWeight: 700,
        opacity: 0.7
    },
    content: {
        color: Color.uwDarkBlue, // Light gray border
        fontSize: 16
    },
    buttonContainer: {
        position: 'absolute',
        alignItems: 'center',
        bottom: '10%',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#6C757D', // Primary color
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 5,
        width: '100%',
    },
    backButton: {
        backgroundColor: '#CCCCCC', // Gray color for the back button
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#FFFFFF', // White text
        fontSize: 16,
        fontWeight: 'bold',
    },
    changePicture: {
        color: '#A9A9A9', // Text color
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deletePicture: {
        color: '#FFFFFF', // Text color
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    expandHeader: {
        flexDirection: 'row',
        width: "100%",
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    expandHeaderText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: "left",
        color: '#333333',

    },
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
        fontWeight: 700
    },
    faqText: {
        color: Color.uwDarkBlue,
        fontSize: 16,
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
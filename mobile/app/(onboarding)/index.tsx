import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    Image,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useDispatch } from 'react-redux';
import { login } from '../_utils/redux/userSlice';
import axios from "axios";

export default function SignUpScreen() {
    const dispatch = useDispatch();
    const handleSignIn = async () => {
        router.push({ pathname: "/sign-in", params: {} });
    };
    const router = useRouter();

    const handleSignUp = async () => {
        router.push({ pathname: "/sign-up" });
    };

    const handleTempLogin = async () => {
        const response: AxiosResponse = await axios.post(
            `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
            {
                isTemporary: true
            }
        );
        const content = response.data;
        dispatch(login({
            userId: content.data._id,
            authToken: content.authToken,
            refreshToken: content.refreshToken
        }))
        router.push({ pathname: "/(tabs)" });
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../../assets/images/onboarding/splash.png")}
                style={styles.background}
            >
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        {/* Main content */}
                        <View style={styles.mainContent}>
                            <Image
                                source={require("../../assets/images/onboarding/uw-logo.png")}
                                style={styles.logo}
                            />
                            <Text style={styles.smallText}>UNITED WAY</Text>
                            <Text style={styles.title}>
                                Explore upcoming community events
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.signUpButton}
                                    onPress={handleSignUp}
                                >
                                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.signInButton}
                                    onPress={handleSignIn}
                                >
                                    <Text style={styles.signInButtonText}>Sign In</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.signInButton} onPress={handleTempLogin}>
                                    <Text>Get Started Without An Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Language selector */}
                        <View style={styles.languageContainer}>
                            <TouchableOpacity style={styles.languageButton}>
                                <Text style={styles.languageText}>ES</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.languageButton, styles.languageButtonActive]}
                            >
                                <Text style={[styles.languageText, styles.languageTextActive]}>
                                    EN
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View >
                </SafeAreaView >
            </ImageBackground >
        </View >
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "space-between",
    },
    placeholderBox: {
        alignItems: "center",
        aspectRatio: 1,
        width: "100%",
        borderRadius: 12,
        backgroundColor: "#1815150A",
        marginTop: 20,
    },
    mainContent: {
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
    },
    logo: {
        marginTop: 80,
        marginBottom: 30,
    },
    smallText: {
        fontSize: 16,
        fontFamily: "BarlowCondensedBoldItalic",
        color: "white",
        letterSpacing: -0.02 * 16, // -2% kerning
    },
    title: {
        color: "white",
        fontSize: 48,
        fontFamily: "BarlowCondensedBoldItalic",
        textTransform: "uppercase",
        textAlign: "center",
        letterSpacing: -0.02 * 48, // -2% kerning
        marginBottom: 100,
    },
    subtitle: {
        fontSize: 24,
        color: "#666",
        marginBottom: 20,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
    },
    signUpButton: {
        backgroundColor: "rgb(4, 52, 110)",
        padding: 16,
        borderRadius: 50,
    },
    signUpButtonText: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        lineHeight: 24,
        textTransform: "uppercase",
    },
    signInButton: {
        backgroundColor: "rgb(255, 255, 255)",
        padding: 16,
        borderRadius: 50,
    },
    signInButtonText: {
        color: "#10167F",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Helvetica",
        lineHeight: 24,
        textTransform: "uppercase",
    },
    languageContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        marginTop: 15,
        backgroundColor: "#F2F2F2",
        borderRadius: 8,
        padding: 2,
        alignSelf: "center",
    },
    languageButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    languageButtonActive: {
        backgroundColor: "#10167F",
    },
    languageText: {
        fontSize: 16,
        color: "#333",
    },
    languageTextActive: {
        color: "white",
    },
});

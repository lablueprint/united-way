import { View, Image } from "react-native"
import { StyleSheet } from "react-native"

import { Color } from "../_styles/global"
export default function Loader() {
    return (
        <View style={styles.container}>
            <Image source={require("../../assets/images/uwLogo.png")} style={styles.image} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.uwDarkBlue,
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        width: 120,
        height: 120
    }
})
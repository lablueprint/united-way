import { StyleSheet } from "react-native"
export const Color = {
    uwBlue: "#0B57B3",
    uwDarkBlue: "#10167F",
    uwOrange: "#FBA541",
    uwLightBlue: "#E7F3FE",
    uwWhite: "#FFFFFF",
    uwRed: "#D85747"
}

export const Typography = StyleSheet.create({
    h1: {
        fontFamily: 'BarlowCondensedBoldItalic',
        fontSize: 100,
        fontWeight: 800,
        fontStyle: "italic",
    },
    h2: {
        fontFamily: 'BarlowCondensedBoldItalic',
        fontSize: 80,
        fontWeight: 700,
        fontStyle: "italic"
    },
    h3: {
        fontFamily: 'BarlowCondensedBoldItalic',
        fontSize: 48,
        fontWeight: 700,
        fontStyle: "italic"
    },
    h4: {
        fontFamily: "Helvetica",
        fontSize: 28,
        fontWeight: 700,
    },
    h5: {

    },
    body1: {
        fontFamily: "Helvetica",
        fontSize: 22,
        fontWeight: 400,
    },
    body2: {
        fontFamily: "Helvetica",
        fontSize: 18,
        fontWeight: 400,
    },
    button: {
        fontFamily: "Helvetica",
        fontSize: 20,
        fontWeight: 700,
    },
    tag: {
        fontFamily: "Helvetica",
        fontSize: 16,
        fontWeight: 700,
    }
})
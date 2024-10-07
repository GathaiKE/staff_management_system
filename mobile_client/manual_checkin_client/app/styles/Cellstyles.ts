import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

export default StyleSheet.create({
  root: { padding: 20, minHeight: 300 },
  title: { textAlign: "center", fontSize: 30 },
  codeFieldRoot: {
    marginTop: 20,
    width: 580,
    marginLeft: "auto",
    marginRight: "auto",
  },
  cell: {
    // width: 25,
    // height: 30,
    lineHeight: 70,
    fontSize: 40,
    borderWidth: 2,
    borderRadius: 3,
    borderColor: "#9f9fdf",
    textAlign: "center",
    width: wp("8%"),
    height: hp("11%"),
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  separator: {
    height: 2,
    width: 10,
    backgroundColor: "#000",
    alignSelf: "center",
  },
  focusCell: {
    borderColor: "#000",
    borderBottomColor: "#007AFF",
    borderBottomWidth: 5,
  },
});

import React from "react";
import Toast from "react-native-toast-message";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol,
} from "react-native-responsive-screen";

function Toastnotify(type: string, titletext: string, titletext2: string) {
  return Toast.show({
    type: type, //"error",
    position: "top",
    text1: titletext, //"Failed",
    text2: titletext2, //"Check credentials & Try again",
    text1Style: {
      fontSize: hp("1.4%"),
      fontWeight: "bold",
      // lineHeight: hp("3%"),
    },
    text2Style: {
      fontSize: hp("1%"),
      fontWeight: "bold",
      // lineHeight: hp("3%"),
    },
    topOffset: hp("3%"),
    visibilityTime: 4000,
  });
}

export default Toastnotify;

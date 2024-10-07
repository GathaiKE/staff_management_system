import React from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { View, Text } from "react-native";

const Index = ({ text = "Back" }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.button}>
      <Pressable onPress={() => handlePress()}>
        <View style={{ flexDirection: "row" }}>
          <Icon name="arrow-back" size={30} color="white" text="back" />
          <Text style={{ color: "white", fontSize: 20, margin: "0.199%" }}>
            Back
          </Text>
        </View>
      </Pressable>
    </View>
  );
};
export default Index;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginBottom: 20,
    borderRadius: 4,
    elevation: 30,
    backgroundColor: "#900900",
    position: "relative",
    right: -570,
    top: -492,
    bottom: 200,
  },
});

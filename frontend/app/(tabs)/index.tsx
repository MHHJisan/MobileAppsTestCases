// app/(tabs)/index.tsx
import React from "react";
import { Text, View } from "react-native";
import RecorderUploader from "../components/RecorderUploader";

export default function MainScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Word Count Audio Recorder
      </Text>
      <RecorderUploader />
    </View>
  );
}

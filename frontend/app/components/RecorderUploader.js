import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecorderUploader() {
  const [recording, setRecording] = useState(null);
  const [word, setWord] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState("");

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        return Alert.alert(
          "Permission required",
          "Microphone access is needed"
        );
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error("Start recording error:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) await uploadAudio(uri);
    } catch (err) {
      console.error("Stop recording error:", err);
      Alert.alert("Error", "Could not stop recording.");
    }
  };

  const uploadAudio = async (uri) => {
    setIsUploading(true);
    setResult("");
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error("File does not exist at URI");

      const fileName = uri.split("/").pop();

      const formData = new FormData();
      formData.append("word", word);
      formData.append("file", {
        uri,
        name: fileName || "audio.wav",
        type: "audio/wav",
      });

      const response = await axios.post(
        "http://192.168.0.103:8000/count-word",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(`Word Count: ${response.data.count}`);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload failed",
        error?.response?.data?.error || error.message
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Audio Word Counter</Text>

      <TextInput
        placeholder="Enter word to count"
        value={word}
        onChangeText={setWord}
        style={styles.input}
        editable={!isUploading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          recording ? styles.stopButton : styles.recordButton,
        ]}
        onPress={recording ? stopRecording : startRecording}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {recording ? "Stop Recording" : "Start Recording"}
        </Text>
      </TouchableOpacity>

      {isUploading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      )}

      {result !== "" && <Text style={styles.resultText}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultText: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
});

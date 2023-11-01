import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';

export default function FriendAudioPlayer({ friend }) {
  const initialScaleValues = friend.audios.map(() => new Animated.Value(1));
  const [scaleAnims] = useState(initialScaleValues);

  async function playFriendAudio(audioPath) {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(audioPath);
      await soundObject.playAsync();
    } catch (error) {
      console.error("Error playing sound", error);
    }
  }

  const handlePressIn = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.7,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{friend.name}'s Audios:</Text>
      <View style={styles.buttonRow}>
        {friend.audios.map((audioPath, index) => (
          <Animated.View key={index} style={{ transform: [{ scale: scaleAnims[index] }] }}>
            <TouchableOpacity
              style={styles.button}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onPress={() => playFriendAudio(audioPath)}
            >
              <Text style={styles.buttonText}>{`Audio ${index + 1}`}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center', 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: '#006400',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#7FFFD4',
    fontSize: 16,
  },
});

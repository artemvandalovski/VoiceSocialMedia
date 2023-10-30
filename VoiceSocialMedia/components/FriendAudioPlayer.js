import React from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function FriendAudioPlayer({ friend }) {
  async function playFriendAudio(audioPath) {
    const soundObject = new Audio.Sound();
    try {
        await soundObject.loadAsync(audioPath);
        await soundObject.playAsync();
    } catch (error) {
        console.error("Error playing sound", error);
    }
}

  
    return (
      <View style={{ padding: 20, backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 20 }}>
        <Text>{friend.name}'s Audios:</Text>
        <Button 
          title="Play Audio 1"
          onPress={() => playFriendAudio(friend.audios[0])}
        />
        <Button 
          title="Play Audio 2"
          onPress={() => playFriendAudio(friend.audios[1])}
        />
        <Button 
          title="Play Audio 3"
          onPress={() => playFriendAudio(friend.audios[2])}
        />
      </View>
    );
  }
  
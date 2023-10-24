import React, { useState, useRef, useEffect } from 'react';
import { Button, View, Text, TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo-av';
import AudioFeedback from './components/AudioFeedback';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [soundInstance, setSoundInstance] = useState(null);
  const startJingle = useRef(new Audio.Sound());
  const stopJingle = useRef(new Audio.Sound());


  useEffect(() => {
    async function preloadSounds() {
      try {
        await startJingle.current.loadAsync(require('./assets/startJingle.mp3'));
        await stopJingle.current.loadAsync(require('./assets/stopJingle.mp3'));
      } catch (error) {
        console.error("Error loading sound files", error);
      }
    }
    preloadSounds();
    return () => {
      startJingle.current.unloadAsync();
      stopJingle.current.unloadAsync();
    };
  }, []);

  async function startRecording() {
    try {
      if (startJingle.current._loaded) {
        await startJingle.current.stopAsync(); 
        await startJingle.current.setPositionAsync(0); 
      }
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (stopJingle.current._loaded) {
      await stopJingle.current.stopAsync(); 
      await stopJingle.current.setPositionAsync(0);
      await stopJingle.current.playAsync();
    }
    console.log('Stopping recording..');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);

    const { sound } = await Audio.Sound.createAsync({ uri });
    setSoundInstance(sound);
    setRecording(null);
  }

  async function playSound() {
    if (soundInstance) {
      console.log('Playing Sound');
      await soundInstance.playAsync();
    } else {
      console.log('No sound instance available');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {recording && <AudioFeedback isRecording={!!recording} />}
      <TouchableWithoutFeedback 
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <View style={{ padding: 20, backgroundColor: 'blue', borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Hold to Record</Text>
        </View>
      </TouchableWithoutFeedback>
      <View style={{ height: 20 }} />
      <Button 
        title="Play Sound"
        onPress={playSound}
      />
    </View>
  );
}

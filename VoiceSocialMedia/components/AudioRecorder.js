import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Box, Button, HStack, VStack } from "native-base";
import * as FileSystem from 'expo-file-system';
import RecordingsDB from '../services/recordingsDB';
import CustomIcon from './CustomIcon';
import AudioFeedback from './AudioFeedback';

const AudioRecorder = ({ onNewRecording }) => {
  const [recordingStatus, setRecordingStatus] = useState(false);
  const [recordingObject, setRecordingObject] = useState(null);

  const randomPeople = ['Steve', 'John', 'Mary', 'Jane', 'Bob', 'Alice'];

  async function setupRecorder() {
    const recording = new Audio.Recording();
    try {
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecordingObject(recording);
    } catch (error) {
      console.error('Failed to prepare audio recording:', error);
    }
  }

  useEffect(() => {
    async function requestPermissions() {
      await Audio.requestPermissionsAsync();
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        console.error('Audio permissions not granted!');
      }
    }

    requestPermissions();
    if (!recordingObject) {
      setupRecorder();
    }
  }, []);

  const startRecording = async () => {
    try {
      if (!recordingObject) {
        await setupRecorder();
      }
      if (recordingObject && recordingObject._canRecord) {
        await recordingObject.startAsync();
        setRecordingStatus(true);
      } else {
        console.error('Recording object is not ready.');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingStatus(false);
    }
  }

  const stopRecording = async () => {
    try {
      await recordingObject.stopAndUnloadAsync();
      const uri = recordingObject.getURI();
      await saveRecording(uri);
      await setupRecorder();
      setRecordingStatus(false);
      onNewRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const saveRecording = async (uri) => {
    const fileExtension = uri.split('.').pop();
    const timestamp = new Date().getTime();
    const newUri = `${FileSystem.documentDirectory}recording_${timestamp}.${fileExtension}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newUri
    });

    const randomPerson = Math.random() < 0.5 ? 'Me' : randomPeople[Math.floor(Math.random() * randomPeople.length)];
    await RecordingsDB.addRecording(newUri, randomPerson);
  };

  return (
    <Box width="100%" justifyContent="center" alignItems="center" position="absolute" bottom={0} p={5}>
      {recordingStatus && <AudioFeedback isRecording={recordingStatus} />}
      <Button onPress={() => recordingStatus ? stopRecording() : startRecording()} size="lg" borderRadius={'xl'} width="90%" colorScheme="blue" variant="solid">
        {recordingStatus ? <CustomIcon name="stop" /> : <CustomIcon name="microphone" />}
      </Button >
    </Box>
  );
};

export default AudioRecorder;

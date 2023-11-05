import React, { useEffect, useState, useCallback } from 'react';
import { LogBox } from 'react-native';
import { NativeBaseProvider, ScrollView } from 'native-base';
import Recording from './models/recording';
import RecordingsDB from './services/db';
import AudioRecorder from './components/AudioRecorder';
import VoiceMessagesList from './components/VoiceMessagesList';

export default function App() {
  const [recordings, setRecordings] = useState([]);

  const updateRecordings = useCallback(async () => {
    const data = await RecordingsDB.getAllRecordings();
    const recordingsList = data.map(rec => new Recording(rec.id, rec.uri, rec.user));
    setRecordings(recordingsList);
  }, []);

  useEffect(() => {
    LogBox.ignoreLogs([
      'In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.',
    ]);

    updateRecordings();
  }, [updateRecordings]);

  return (
    <NativeBaseProvider>
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: '19%', marginHorizontal: 20 }}>
        <VoiceMessagesList recordings={recordings} />
      </ScrollView>
      <AudioRecorder onNewRecording={updateRecordings} />
    </NativeBaseProvider >
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Button, View, Text, TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo-av';
import AudioFeedback from './components/AudioFeedback';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const db = SQLite.openDatabase('recordings.db');

export default function App() {
  const [recording, setRecording] = useState(null);
  const [soundInstance, setSoundInstance] = useState(null);
  const startJingle = useRef(new Audio.Sound());
  const stopJingle = useRef(new Audio.Sound());
  const [lastRecordingUri, setLastRecordingUri] = useState(null);
  const [recordings, setRecordings] = useState([]);




  useEffect(() => {
    async function preloadSounds() {
      try {
        await startJingle.current.loadAsync(require('./assets/startJingle.mp3'));
        await stopJingle.current.loadAsync(require('./assets/stopJingle.mp3'));
      } catch (error) {
        console.error("Error loading sound files", error);
      }
    }

    db.transaction(tx => {
      tx.executeSql(
          'CREATE TABLE IF NOT EXISTS recordings (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT);',
          [],
          () => console.log('Table created or already exists'),
          (_, error) => console.error('Table creation error:', error)
      );
  });

  function fetchRecordingsFromDB() {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM recordings ORDER BY id DESC LIMIT 3;', [], (_, { rows }) => {
        const uris = [];
        for(let i = 0; i < rows.length; i++) {
          uris.push(rows.item(i).uri);
        }
        setRecordings(uris);
      });
    });
  }


    preloadSounds();
    fetchRecordingsFromDB();
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
    setLastRecordingUri(uri);
    console.log('Recording stopped and stored at', uri);

    console.log('Recording stopped and stored at', uri);

    const { sound } = await Audio.Sound.createAsync({ uri });
    sound.setOnPlaybackStatusUpdate((status) => playbackStatusUpdate(status, sound));
    setSoundInstance(sound);
    setRecording(null);
  }

  function playbackStatusUpdate(status, sound) {
    if (status.didJustFinish) {
       // sound.setPositionAsync(0);
    }
}


async function playSound() {
  if (soundInstance) {
      console.log('Playing Sound');
      await soundInstance.setPositionAsync(0);
      await soundInstance.playAsync();
  } else {
      console.log('No sound instance available');
  }
}


async function saveRecordingToDB() {
  if (lastRecordingUri) {
    const tempUri = lastRecordingUri;
    const fileExtension = tempUri.split('.').pop();
    const timestamp = new Date().getTime();
    const newUri = `${FileSystem.documentDirectory}recording_${timestamp}.${fileExtension}`;

    await FileSystem.copyAsync({
      from: tempUri,
      to: newUri
    });

    db.transaction(tx => {
      tx.executeSql('INSERT INTO recordings (uri) VALUES (?);', [newUri]);
    },
    (error) => {
      console.error("DB Error:", error);
    },
    () => {
      console.log('Recording saved to DB with URI:', newUri);
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM recordings ORDER BY id DESC LIMIT 3;', [], (_, { rows }) => {
          const uris = [];
          for(let i = 0; i < rows.length; i++) {
            uris.push(rows.item(i).uri);
          }
          setRecordings(uris);
        });
      });
    });
  } else {
    console.log('No recording to save');
  }
}





async function playSavedRecording() {
  db.transaction(tx => {
      tx.executeSql('SELECT * FROM recordings ORDER BY id DESC LIMIT 1;', [], (_, { rows }) => {
          const uri = rows.item(0).uri;
          if (uri) {
              (async () => {
                  const { sound } = await Audio.Sound.createAsync({ uri });
                  sound.setOnPlaybackStatusUpdate((status) => playbackStatusUpdate(status, sound));
                  await sound.playAsync();
              })();
          }
      });
  });
}

function playRecording(index) {
  if (recordings[index]) {
    (async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: recordings[index] });
      sound.setOnPlaybackStatusUpdate((status) => playbackStatusUpdate(status, sound));
      await sound.playAsync();
    })();
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

<Button 
        title="Save Recording"
        onPress={saveRecordingToDB}
      />
      <View style={{ height: 20 }} />
    <Button 
      title="Play Audio 1"
      onPress={() => playRecording(0)}
    />

    <View style={{ height: 20 }} />
    <Button 
      title="Play Audio 2"
      onPress={() => playRecording(1)}
    />

    <View style={{ height: 20 }} />
    <Button 
      title="Play Audio 3"
      onPress={() => playRecording(2)}
    />
    </View>

  );

}

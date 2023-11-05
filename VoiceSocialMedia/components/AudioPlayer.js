import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Box, Text, Progress, HStack, Center } from "native-base";
import CustomIcon from './CustomIcon';

const AudioPlayer = ({ source }) => {
  const [sound, setSound] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  useEffect(() => {
    async function loadAudio() {
      const { sound } = await Audio.Sound.createAsync(source);
      setSound(sound);
    }

    loadAudio();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [source]);

  const togglePlay = async () => {
    if (sound) {
      isPlaying ? await sound.pauseAsync() : await sound.playAsync();
    }
  };

  if (sound) {
    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      setPlaybackStatus(playbackStatus);
      if (playbackStatus.didJustFinish) {
        sound.stopAsync();
        sound.setPositionAsync(0);
      }
    });
  }

  const isPlaying = playbackStatus && playbackStatus.isPlaying;
  const duration = playbackStatus && playbackStatus.durationMillis;
  const position = playbackStatus && playbackStatus.positionMillis;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box>
      <TouchableOpacity onPress={togglePlay}>
        <HStack>
          <Center>
            {isPlaying ? <CustomIcon name="pause" size={20} /> : <CustomIcon name="play" size={20} />}
          </Center>
          <Center w="70%">
            <Box w="100%" maxW="400">
              <Progress colorScheme="dark" value={position} max={duration} mx="4" />
            </Box>
          </Center>
          <Center>
            <Text color={'white'}>{isPlaying ? formatTime(position) : formatTime(duration)}</Text>
          </Center>
        </HStack>
      </TouchableOpacity>
    </Box >
  );
};

export default AudioPlayer;

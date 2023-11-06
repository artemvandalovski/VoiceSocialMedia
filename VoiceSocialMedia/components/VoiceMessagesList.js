import React, { useEffect, useState } from 'react';
import { Box, HStack, Text, VStack } from "native-base";
import AudioPlayer from './AudioPlayer';
import UsersDB from '../services/usersDB';
import { TouchableOpacity } from 'react-native';
import CustomIcon from './CustomIcon';


const VoiceMessagesList = ({ recordings }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    async function getCurrentUser() {
      const user = await UsersDB.getUserById(1);
      setCurrentUser(user);
    }

    async function getFriends() {
      const friends = await UsersDB.getFollowingById(currentUser.id);
      setFriends(friends);
    }

    if (currentUser) {
      getFriends();
    } else {
      getCurrentUser();
    }
  }, [currentUser]);

  const isFriend = (name) => {
    return friends.find(friend => friend.name === name);
  }

  const isCurrentUser = (name) => {
    if (!currentUser) return false;
    return name === currentUser.name;
  }

  async function addFriend(name) {
    const followedUser = await UsersDB.getUserByName(name);
    UsersDB.followUser(currentUser.id, followedUser.id);
    setFriends([...friends, followedUser]);
  }

  const removeFriend = (name) => {
    const unfollowedUser = friends.find(friend => friend.name === name);
    UsersDB.unfollowUser(currentUser.id, unfollowedUser.id);
    setFriends(friends.filter(friend => friend.name !== name));
  }

  return (
    <VStack safeArea space={4}>
      {recordings.map(recording => (
        <Box key={recording.id} alignSelf={isCurrentUser(recording.user) ? 'flex-end' : ''} width={isCurrentUser(recording.user) ? '50%' : '70%'}
          p={isFriend(recording.user) && 3} borderLeftWidth={isFriend(recording.user) ? 3 : 0} borderLeftColor="gray.300">
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <Text> {recording.user} </Text>
            {!isCurrentUser(recording.user) &&
              <TouchableOpacity onPress={() => isFriend(recording.user) ? removeFriend(recording.user) : addFriend(recording.user)}>
                <CustomIcon name={isFriend(recording.user) ? "user-times" : "user-plus"} size={20} color="grey" />
              </TouchableOpacity>
            }
          </HStack>
          <Box p={3} rounded="xl"
            bg={isCurrentUser(recording.user) ? 'blue.400' : 'dark.400'} key={recording.id}>
            <AudioPlayer source={{ uri: recording.uri, user: recording.user }} />
          </Box>
        </Box>
      ))
      }
    </VStack >
  );
}

export default VoiceMessagesList;
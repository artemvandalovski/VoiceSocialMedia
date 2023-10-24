import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function AudioFeedback({ isRecording }) {
  const animation = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        const randomHeight = Math.random();
        Animated.timing(animation, {
          toValue: randomHeight,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }, 100);
    } else {
      if (interval) {
        clearInterval(interval);  // Ensure interval is cleared when isRecording becomes false
      }
      Animated.timing(animation, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (interval) {
        clearInterval(interval);  // Clear interval when component is unmounted or re-rendered
      }
    }
  }, [isRecording]);

  const animatedStyle = {
    transform: [{ scaleX: animation }],
  };

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

const styles = StyleSheet.create({
  bar: {
    height: 50,
    width: 120,
    backgroundColor: 'gray',
    alignSelf: 'center',
    margin: 10,
  },
});

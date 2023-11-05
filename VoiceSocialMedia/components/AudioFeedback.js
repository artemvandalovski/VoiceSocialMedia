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
        clearInterval(interval);
      }
      Animated.timing(animation, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
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
    width: '90%',
    height: 20,
    borderRadius: 100,
    backgroundColor: 'dodgerblue',
    margin: 10,
  },
});

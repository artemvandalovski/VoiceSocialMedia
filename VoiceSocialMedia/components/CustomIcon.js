import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CustomIcon extends React.Component {
  render() {
    const { name, size = 30, color = 'white' } = this.props;
    return (
      <Icon name={name} size={size} color={color} />
    );
  }
}

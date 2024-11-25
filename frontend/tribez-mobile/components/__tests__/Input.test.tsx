import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Test Input" />
    );
    
    expect(getByPlaceholderText('Test Input')).toBeTruthy();
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <Input
        placeholder="Test Input"
        error="This is an error message"
      />
    );
    
    expect(getByText('This is an error message')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        onChangeText={onChangeText}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Test Input'), 'new text');
    expect(onChangeText).toHaveBeenCalledWith('new text');
  });

  it('handles focus and blur events', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
    
    const input = getByPlaceholderText('Test Input');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();
    
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        style={{ backgroundColor: 'red' }}
      />
    );
    
    const input = getByPlaceholderText('Test Input');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: 'red' })
    );
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<any>();
    render(
      <Input
        placeholder="Test Input"
        ref={ref}
      />
    );
    
    expect(ref.current).toBeTruthy();
  });

  it('disables input when editable is false', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        editable={false}
      />
    );
    
    const input = getByPlaceholderText('Test Input');
    expect(input.props.editable).toBe(false);
  });

  it('handles secure text entry', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Password"
        secureTextEntry
      />
    );
    
    const input = getByPlaceholderText('Password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('handles keyboard type', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Email"
        keyboardType="email-address"
      />
    );
    
    const input = getByPlaceholderText('Email');
    expect(input.props.keyboardType).toBe('email-address');
  });

  it('handles return key type', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        returnKeyType="next"
      />
    );
    
    const input = getByPlaceholderText('Test Input');
    expect(input.props.returnKeyType).toBe('next');
  });

  it('handles submit editing', () => {
    const onSubmitEditing = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test Input"
        onSubmitEditing={onSubmitEditing}
      />
    );
    
    const input = getByPlaceholderText('Test Input');
    fireEvent(input, 'submitEditing');
    expect(onSubmitEditing).toHaveBeenCalled();
  });
});

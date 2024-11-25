import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { Colors } from '../../constants/Theme';

describe('Button Component', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    fireEvent.press(getByText('Test Button'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { queryByText, getByTestId } = render(
      <Button {...defaultProps} loading={true} />
    );
    expect(queryByText('Test Button')).toBeNull();
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const { getByText } = render(<Button {...defaultProps} disabled={true} />);
    fireEvent.press(getByText('Test Button'));
    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });

  describe('Button Variants', () => {
    it('applies primary variant styles correctly', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="primary" />
      );
      const button = getByText('Test Button').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: Colors.primary,
          }),
        ])
      );
    });

    it('applies secondary variant styles correctly', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="secondary" />
      );
      const button = getByText('Test Button').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: Colors.background,
          }),
        ])
      );
    });

    it('applies outline variant styles correctly', () => {
      const { getByText } = render(
        <Button {...defaultProps} variant="outline" />
      );
      const button = getByText('Test Button').parent;
      expect(button?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: 'transparent',
            borderColor: Colors.primary,
          }),
        ])
      );
    });
  });

  describe('Button Sizes', () => {
    it('applies small size styles correctly', () => {
      const { getByText } = render(
        <Button {...defaultProps} size="small" />
      );
      const buttonText = getByText('Test Button');
      expect(buttonText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: expect.any(Number),
          }),
        ])
      );
    });

    it('applies large size styles correctly', () => {
      const { getByText } = render(
        <Button {...defaultProps} size="large" />
      );
      const buttonText = getByText('Test Button');
      expect(buttonText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe('Platform Specific Behavior', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      // @ts-ignore
      Platform.OS = originalPlatform;
    });

    it('uses TouchableOpacity on iOS', () => {
      // @ts-ignore
      Platform.OS = 'ios';
      const { getByText } = render(<Button {...defaultProps} />);
      const button = getByText('Test Button').parent;
      expect(button?.props.accessibilityRole).toBe('button');
    });

    it('uses Pressable on Android and web', () => {
      // @ts-ignore
      Platform.OS = 'android';
      const { getByText } = render(<Button {...defaultProps} />);
      const button = getByText('Test Button').parent;
      expect(button?.props.accessibilityRole).toBe('button');
    });
  });

  it('applies custom styles when provided', () => {
    const customStyle = {
      backgroundColor: 'red',
      borderRadius: 10,
    };
    const { getByText } = render(
      <Button {...defaultProps} style={customStyle} />
    );
    const button = getByText('Test Button').parent;
    expect(button?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle),
      ])
    );
  });

  it('applies custom text styles when provided', () => {
    const customTextStyle = {
      fontSize: 20,
      color: 'red',
    };
    const { getByText } = render(
      <Button {...defaultProps} textStyle={customTextStyle} />
    );
    const buttonText = getByText('Test Button');
    expect(buttonText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customTextStyle),
      ])
    );
  });
});

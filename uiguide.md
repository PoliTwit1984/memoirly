# UI Development Guide for Tribez

## Core Principles

### 1. Platform-Specific Design
- Follow platform conventions while maintaining brand consistency
- iOS: Use native iOS components and gestures
- Web: Follow responsive web design principles
- Use platform-specific components when necessary (e.g., `IconSymbol.ios.tsx` vs `IconSymbol.tsx`)

### 2. Responsive Design
```typescript
// hooks/useResponsive.ts
export const useResponsive = () => {
  const { width } = useWindowDimensions();
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024
  };
};
```

### 3. Component Architecture

#### Base Components
```typescript
// components/ThemedText.tsx - Example of a base component
export const ThemedText = styled.Text<TextProps>`
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.regular};
`;
```

#### Compound Components
```typescript
// components/Input.tsx - Example of a compound component
export const Input = {
  Root: styled.View`
    margin-vertical: 8px;
  `,
  Label: styled(ThemedText)`
    margin-bottom: 4px;
  `,
  Field: styled.TextInput`
    padding: 12px;
    border-radius: 8px;
  `,
  Error: styled(ThemedText)`
    color: ${props => props.theme.colors.error};
    margin-top: 4px;
  `
};
```

## Development Workflow

### 1. Development Builds
- Use development builds instead of Expo Go for production apps
- Development builds provide more flexibility and reliability
- Include expo-dev-client for better development experience
- Can be created locally or using EAS Build

### 2. Continuous Native Generation (CNG)
- Generate native projects on-demand from app.json and package.json
- Add android/ and ios/ to .gitignore
- Use `npx expo prebuild --clean` to regenerate native projects
- Helps with React Native version upgrades
- Simplifies project maintenance

### 3. Native Project Management
Options for handling native code:
1. CNG Approach (Recommended):
   - Use app.json/app.config.js for configuration
   - Use config plugins for native customization
   - Regenerate projects as needed
2. Direct Native Editing:
   - Make changes directly in Android Studio/Xcode
   - Cannot use prebuild after direct modifications
   - Maintain native changes manually

## Design System

### 1. Theme Configuration
```typescript
// constants/Theme.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    error: '#FF3B30'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  fonts: {
    regular: 'SpaceMono-Regular',
    bold: 'SpaceMono-Bold'
  }
};
```

### 2. Platform-Specific Styles
```typescript
// utils/platformStyles.ts
export const getPlatformStyles = (platform: 'ios' | 'web') => ({
  shadow: platform === 'ios' 
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    : {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)'
      }
});
```

## Build and Deploy Considerations

### 1. Development Workflow Options
- Cloud-based with EAS Build:
  - No local Android Studio/Xcode needed
  - Easy sharing with team members
  - Integrated with EAS services
- Local Development:
  - Direct access to native debugging tools
  - Faster iteration for native code changes
  - Better for complex native debugging

### 2. Testing Distribution
- Use Internal Distribution for team testing
- Support multiple active builds simultaneously
- Faster than TestFlight/Play Store Beta
- Easy build sharing via QR codes

### 3. Production Updates
- Use expo-updates for instant JS updates
- EAS Update for CDN-based update delivery
- Supports HTTP/3 for modern clients
- Monitor update adoption in EAS dashboard

### 4. Monitoring and Analytics
- Implement crash reporting (Sentry/BugSnag)
- Track user interactions with analytics
- Monitor update adoption rates
- Track performance metrics

## Performance Guidelines

### 1. Development Performance
- Use development builds for accurate performance testing
- Implement proper error boundaries
- Monitor JS bundle size
- Use performance monitoring tools

### 2. Production Optimization
- Enable Hermes engine
- Implement proper caching strategies
- Optimize images and assets
- Use production builds for real performance testing

## Testing Strategy

### 1. Component Testing
```typescript
// components/__tests__/Button.test.tsx
describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button label="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });
});
```

### 2. Development Testing
- Test across different devices
- Use development builds for accurate testing
- Test platform-specific features
- Verify native integration points

## Documentation Standards

### 1. Component Documentation
```typescript
/**
 * Button component that follows platform-specific design guidelines
 * @param {string} label - Button text
 * @param {() => void} onPress - Press handler
 * @param {'primary' | 'secondary'} variant - Button style variant
 */
```

### 2. Project Organization
```
project/
├── app/                 # App entry points and routing
├── components/         # Reusable UI components
├── services/          # API and business logic
├── utils/            # Helper functions
└── __tests__/       # Test files
```

## Version Control Best Practices

### 1. Native Project Management
- Add android/ and ios/ to .gitignore when using CNG
- Commit app.config.js changes
- Document native dependencies
- Track config plugin versions

### 2. Development Environment
- Document required native tools
- Maintain .env.example
- Track expo-cli version
- Document required global dependencies

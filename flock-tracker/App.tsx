import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, ScrollView } from 'react-native';
import RootNavigator from './src/navigation';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 12 }}>
            App crashed — copy this and send it:
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>
            {err.toString()}{'\n\n'}{err.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View, useColorScheme } from 'react-native';
import { dark, light } from '../theme/tokens';
import { shadows } from '../theme/shadows';
import { fontFamily } from '../theme/typography';

type State = { error: Error | null; info: string };

/** Last error text, also readable by the global handler. */
export function installGlobalErrorHandler() {
  const g = globalThis as unknown as { ErrorUtils?: { getGlobalHandler?: () => (e: unknown, fatal?: boolean) => void; setGlobalHandler?: (h: (e: unknown, fatal?: boolean) => void) => void }; __rovnoHandler?: boolean };
  const eu = g.ErrorUtils;
  if (!eu?.setGlobalHandler || g.__rovnoHandler) return;
  g.__rovnoHandler = true;
  const prev = eu.getGlobalHandler?.();
  eu.setGlobalHandler((e, fatal) => {
    try {
      const err = e as Error;
      console.error(`[rovno] ${fatal ? 'FATAL' : 'non-fatal'} JS error: ${err?.message ?? String(e)}\n${err?.stack ?? ''}`);
    } catch { /* ignore */ }
    prev?.(e, fatal);
  });
}

function Fallback({ error, info, onReset }: { error: Error; info: string; onReset: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const c = isDark ? dark : light;
  const sh = shadows(c);
  const [copied, setCopied] = useState(false);
  const text = `${error.name}: ${error.message}\n\n${error.stack ?? ''}${info ? `\n\nComponent stack:${info}` : ''}`;
  const copy = async () => {
    try {
      const nav = (globalThis as unknown as { navigator?: { clipboard?: { writeText: (s: string) => Promise<void> } } }).navigator;
      if (Platform.OS === 'web' && nav?.clipboard) { await nav.clipboard.writeText(text); setCopied(true); return; }
      await Share.share({ message: text });
    } catch { /* ignore */ }
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 16, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 420 }}>
        <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 26, color: c.navy }}>Что-то пошло не так</Text>
        <Text selectable style={{ fontFamily: fontFamily.bold, fontSize: 14, color: c.accent, marginTop: 8 }}>{error.message || String(error)}</Text>
        <View style={{ flex: 1, marginTop: 16, borderRadius: 24, backgroundColor: c.bg, boxShadow: sh.inset, padding: 14 }}>
          <ScrollView>
            <Text selectable style={{ fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 11, lineHeight: 16, color: c.text2 }}>
              {error.stack ?? ''}{info ? `\n\nComponent stack:${info}` : ''}
            </Text>
          </ScrollView>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <Pressable onPress={copy} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', paddingVertical: 15, borderRadius: 99, backgroundColor: c.bg, boxShadow: sh.raisedS }}>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14, color: c.navy }}>{copied ? 'Скопировано' : 'Копировать'}</Text>
          </Pressable>
          <Pressable onPress={onReset} accessibilityRole="button" style={{ flex: 1, alignItems: 'center', paddingVertical: 15, borderRadius: 99, backgroundColor: c.accent, boxShadow: sh.pill }}>
            <Text style={{ fontFamily: fontFamily.extrabold, fontSize: 14, color: '#fff' }}>Перезапустить</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: '' };
  static getDerivedStateFromError(error: Error): State { return { error, info: '' }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[rovno] ErrorBoundary: ${error.message}\n${error.stack ?? ''}${info.componentStack ?? ''}`);
    this.setState({ info: info.componentStack ?? '' });
  }
  reset = () => this.setState({ error: null, info: '' });
  render() {
    if (this.state.error) return <Fallback error={this.state.error} info={this.state.info} onReset={this.reset} />;
    return this.props.children;
  }
}

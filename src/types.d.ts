export {};

declare global {
  interface EarthSoundSpeechResult extends ArrayLike<{ transcript: string; confidence?: number }> { readonly isFinal: boolean }
  interface EarthSoundSpeechResultList extends ArrayLike<EarthSoundSpeechResult> {}
interface EarthSoundSpeechEvent extends Event { readonly results: EarthSoundSpeechResultList; readonly resultIndex?: number }
interface EarthSoundSpeechErrorEvent extends Event { readonly error: string }
interface EarthSoundSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: EarthSoundSpeechEvent) => void) | null;
    onerror: ((event: EarthSoundSpeechErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }
  interface Window {
    SpeechRecognition?: new () => EarthSoundSpeechRecognition;
    webkitSpeechRecognition?: new () => EarthSoundSpeechRecognition;
  }
  interface WindowEventMap {
    'earthsound:action': CustomEvent<{ action: string; value?: string | number }>;
    'earthsound:page-action': CustomEvent<{ action: string; value?: string | number }>;
    'earthsound:volume': CustomEvent<{ volume: number }>;
    'earthsound:volume-step': CustomEvent<{ amount: number }>;
    'earthsound:volume-update': CustomEvent<{ amount: number }>;
  }
}

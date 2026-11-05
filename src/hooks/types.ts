export type ReturnTypeSonification = {
  status: 'idle' | 'playing' | 'paused' | 'unsupported';
  step: number;
  speed: number;
  setSpeed: (speed: number) => void;
  setSeries: (values: (number | null)[]) => void;
  play: (fromBeginning?: boolean) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  stop: () => void;
  preview: (index: number, duration?: number) => Promise<void>;
  seek: (index: number) => Promise<void>;
};

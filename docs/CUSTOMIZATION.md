# MahiOS Customization & Extension Guide

MahiOS is designed to be fully modular and extensible. You can build new desktop applications, customize retro CRT scanlines, create custom audio synthesizers, and customize themes.

---

## 🚀 1. Building a New Desktop Application

Creating a new retro window application requires only **3 simple steps**:

### Step 1: Create your React Component
Create a new file in `src/components/apps/MyCustomApp.tsx`:
```tsx
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MyCustomApp() {
  return (
    <div className="p-4 space-y-3 text-gray-800">
      <div className="flex items-center gap-2 border-b border-gray-300 pb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-sm font-bold uppercase">My Custom 90s App</h2>
      </div>
      <p className="text-xs leading-relaxed">
        Hello from my new retro application running in MahiOS!
      </p>
    </div>
  );
}
```

### Step 2: Register in Component Map
Add your component to the dynamic renderer switch in `src/components/desktop/Desktop.tsx` (and `TabletShell.tsx` / `MobileShell.tsx`):
```tsx
import MyCustomApp from '@/components/apps/MyCustomApp';

// Inside renderAppContent():
case 'MyCustomApp':
  return <MyCustomApp />;
```

### Step 3: Register in Desktop Apps Studio
Open `/admin/apps` in your browser and click **Register New App**:
- **Title**: `My Custom App`
- **Target Component View**: Select `MyCustomApp`
- **Icon**: Choose an icon (e.g. `Sparkles`)
- **Default Width/Height**: e.g. `720` x `480`
- Click **Save Application**! Your app will immediately appear on the desktop icon grid.

---

## 🔊 2. Customizing System Sound Synthesis

System sounds are generated programmatically using the Web Audio API inside `src/stores/systemStore.ts`.

To add a new sound effect:
```ts
// In src/stores/systemStore.ts:
myCustomChime: () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
```

---

## 📺 3. Modifying CRT Shaders & Scanlines

CRT scanline overlays and phosphor curvature are defined in `src/styles/crt.css`:
- **Scanline Intensity**: Adjust the opacity of `.crt-scanlines::before` (default `rgba(18, 16, 16, 0.4)`).
- **Vignette Darkening**: Tweak radial-gradient stops in `.crt-vignette`.
- **Phosphor Green/Amber**: Change CSS filter matrices in `.crt-green-phosphor`.

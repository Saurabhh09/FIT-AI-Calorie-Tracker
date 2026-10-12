# FITAI mobile

Genuine React Native app for iOS and Android, built with Expo Router. The existing Next.js application remains the web app and the initial shared API/BFF.

## Current status

**Foundation phase only.** This scaffold has no connected authentication, onboarding persistence, food-data integration, nutrition logging, or AI. Its first screen explicitly avoids mock success or fabricated data. No iOS or Android native build has been produced or tested yet.

The app uses Expo SDK 57 / React Native 0.86.3 / React 19.2.3. The repository pins a Node.js 22 baseline (`.nvmrc`; minimum 22.13) to meet Expo's current toolchain guidance. React is aligned at 19.2.3 across the Next and Expo workspaces to avoid duplicate React runtimes. Expo SDK 56 was evaluated first but failed Expo Doctor because of a known Hermes V1 memory regression; it was replaced before platform claims or release builds.

## Run the Expo development server

From the repository root:

```sh
npm install
npm run dev:mobile
```

Then use Expo's development tooling with an iOS Simulator or Android Emulator/device. A web renderer is intentionally not configured here; the Next.js app remains the web product.

## Native build status

The `android` and `ios` scripts invoke local native builds and require their corresponding platform toolchains. An iOS Simulator build requires macOS/Xcode. Release identifiers, signing, development-client profiles, and store configuration are deliberately deferred until the release-build phase. Do not infer platform support from a successful Metro bundle or an Expo Go session.

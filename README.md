# Terra Diary 🗺️📍

**Terra Diary** is a premium, high-performance travel journaling application built with React Native and Expo. It allows explorers to document their journeys, visualize routes through interactive map animations, and relive memories via an immersive Augmented Reality (AR) finder.

---

## ✨ Key Features

### 📸 Dynamic Timeline
* **Rich Media Support**: Store high-quality travel photos with automatic Cloudinary-style optimization.
* **Live Social Sync**: Real-time updates for user profiles, names, and avatars using Firebase `onSnapshot`.
* **Privacy Controls**: Toggle between "Private Vault" and "Global Feed" visibility with a single tap.

### 🗺️ Interactive Route Mapping
* **Animated Journeys**: A "Play" feature that animates the camera along your travel path chronologically.
* **Smart Pin Grouping**: Automatically clusters multiple check-ins at the same location to keep the map clean.

### 👓 AR Explorer (Experimental)
* **Spatial Memories**: Locate your past memories in physical space using the integrated AR Finder.
* **Directional Awareness**: Real-time compass and location tracking to guide you back to your favorite spots.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **Database** | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| **Auth** | [Firebase Auth](https://firebase.google.com/docs/auth) + Google Sign-In |
| **Styling** | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native) |
| **Maps** | [React Native Maps](https://github.com/react-native-maps/react-native-maps) |

---



![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37)
![React Native Maps](https://img.shields.io/badge/React_Native_Maps-4285F4?style=for-the-badge&logo=google-maps&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-0F172A?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)


---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dilinichamikasilva/TerraDiary.git
   cd terra-diary
   ```

2. **Install dependencies**
   ```bash
   npx expo install
   ```

3. **Configure Firebase**
    - Create a **service/firebaseConfig.ts** file.  
    - Add your Firebase API keys and project configuration.

4. **Start the development server**
   ```bash
   npx expo start -c
   ```

---

## 📱 How to Run on Android

You can experience Terra Diary on an Android device using one of the two methods below:

### 1. Development Mode (Fastest)
Use this if you want to see live changes while editing the code.
* **Step 1**: Install the **Expo Go** app from the Google Play Store.
* **Step 2**: Ensure your phone and computer are on the same Wi-Fi network.
* **Step 3**: Run `npx expo start` in your terminal.
* **Step 4**: Scan the QR code appearing in your terminal using the Expo Go app.

### 2. Preview Mode (Standalone APK)
Use this to test the app as a finished product without needing a computer or a terminal.
* **Step 1**: [Download the latest APK](https://expo.dev/accounts/dilini713/projects/terra-diary/builds/af0e7440-a374-4f71-86b3-b3cbd4a997e6) (Generated via EAS Build).
* **Step 2**: Open the `.apk` file on your Android device.
* **Step 3**: If prompted, allow "Installation from Unknown Sources" in your phone settings.
   - Go to **Settings** → **Security** (or Settings → Apps)
   - Enable **"Install from Unknown Sources"** or **"Install Unknown Apps"**
* **Step 4**: Launch **Terra Diary** from your app drawer.


---

## 🎨 Branding & Assets

The app uses a custom Modern Geometric aesthetic:
- Primary Theme Color: #0f172a (Deep Slate)
- Accent Color: #10b981 (Emerald Green)
- Icons: Optimized Adaptive Icons located in assets/images/.

---

## 📱 Screenshots


**Created with ❤️ by Dilini**


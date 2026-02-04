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

## 🎨 Branding & Assets

The app uses a custom Modern Geometric aesthetic:
- Primary Theme Color: #0f172a (Deep Slate)
- Accent Color: #10b981 (Emerald Green)
- Icons: Optimized Adaptive Icons located in assets/images/.

---

## 📱 Screenshots

**Created with ❤️ by Dilini**


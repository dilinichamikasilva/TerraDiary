<p align="center">
   <img src="https://github.com/user-attachments/assets/a2206e1f-cb82-4404-bc8c-bc9b5a2dff2f" width="120" height="120" alt="Terra Diary Logo" />
</p>

<h1 align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=900&size=40&pause=1000&color=10B981&center=true&vCenter=true&width=435&lines=TERRA+DIARY;EXPLORE+THE+WORLD;MAP+YOUR+MEMORIES" alt="Typing SVG" />
  </a>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Build-Expo_EAS-000000?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

**Terra Diary** is a premium, high-performance travel journaling application built with React Native and Expo. It allows explorers to document their journeys, visualize routes through interactive map animations, and relive memories via an immersive Augmented Reality (AR) finder.

---

## ✨ Key Features

Terra Diary is designed with a focus on seamless user experience, high-performance media handling, and innovative spatial tracking.

### 📸 Dynamic Timeline
| Optimization | Live Sync | Privacy |
| :--- | :--- | :--- |
| **Rich Media Support**<br/>Store high-quality travel photos with automatic **Cloudinary** optimization. | **Real-time Engine**<br/>Instant updates for profiles and interactions using Firebase `onSnapshot`. | **Vault Security**<br/>Toggle between "Private Vault" and "Global Feed" visibility with a single tap. |

---

### 🗺️ Interactive Route Mapping
| Feature | Description |
| :--- | :--- |
| **🛣️ Animated Journeys** | A dedicated "Play" mode that animates the map camera along your travel path chronologically. |
| **📍 Smart Pin Grouping** | Uses clustering algorithms to group multiple check-ins, maintaining map clarity at all zoom levels. |

---

### 👓 AR Explorer (Future-Ready)
> [!NOTE]
> This experimental module bridges the gap between digital logs and physical reality.

* **Spatial Memories**: Visualize your past memories pinned in physical space using the integrated **AR Finder**.
* **Directional Awareness**: Leverages the device's **Magnetometer** and **GPS** to guide you back to precise travel spots.

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

## 🛠️ Development & Live Execution

This method is best for developers who want to explore the source code and see live updates through **Hot Reloading**.

<p align="center">
  <img src="https://img.shields.io/badge/Environment-Expo_Go-000000?style=for-the-badge&logo=expo&logoColor=white" height="35" />
</p>

---

### 📋 Prerequisites
* **Node.js** (LTS version)
* **npm** or **yarn**
* **Expo CLI** (`npm install -g expo-cli`)

### 💻 Developer Workflow

| 1. Environment | 2. Connectivity | 3. Execution | 4. Synchronization |
| :---: | :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/Step_1-Download-lightgrey?style=flat-square" /> | <img src="https://img.shields.io/badge/Step_2-Network-lightgrey?style=flat-square" /> | <img src="https://img.shields.io/badge/Step_3-Command-lightgrey?style=flat-square" /> | <img src="https://img.shields.io/badge/Step_4-Scan-lightgrey?style=flat-square" /> |
| Install **Expo Go** from the Play Store. | Connect phone and PC to the **same Wi-Fi**. | Run `npx expo start` in your terminal. | Scan the terminal **QR Code** with Expo Go. |

> [!IMPORTANT]
> **Metro Bundler:** Once the command is running, you can press `r` in the terminal to reload the app or `m` to open the developer menu.

---

## 📦 Getting the App (Preview Mode)

Experience **Terra Diary** as a fully compiled standalone Android application. No developer environment required.

<p align="center">
  <a href="https://expo.dev/accounts/dilini713/projects/terra-diary/builds/cd73407a-11e2-4137-8c1a-aec8d0dcdc54">
    <img src="https://img.shields.io/badge/Download_APK-10B981?style=for-the-badge&logo=android&logoColor=white" height="45" />
  </a>
</p>

---

### 📲 Quick Install Guide

| 1. Download | 2. Permissions | 3. Launch |
| :---: | :---: | :---: |
| <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://expo.dev/accounts/dilini713/projects/terra-diary/builds/cd73407a-11e2-4137-8c1a-aec8d0dcdc54" width="120" /> | 🛠️ | 🚀 |
| **Scan QR Code** to download directly to your phone. | **Enable "Unknown Sources"** in your device settings. | Open **Terra Diary** and start mapping your journey. |

> [!TIP]
> **Why the warning?** Since this APK is built for preview (not downloaded from the Play Store), Android will warn you about "Unknown Apps." This is normal for development builds; simply click **"Install Anyway."**

## 🎨 Branding & Assets

The app uses a custom Modern Geometric aesthetic:
- Primary Theme Color: #0f172a (Deep Slate)
- Accent Color: #10b981 (Emerald Green)
- Icons: Optimized Adaptive Icons located in assets/images/.

---

## 📱 Interface Gallery

### 🔐 Authentication & Onboarding
| Login | Registration |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ca154bc7-cdb3-41d0-87bf-cef9239b4742" height="400" /> | <img src="https://github.com/user-attachments/assets/502f35b6-efa4-47d3-92ab-07600999eedc" height="400" /> |

---

### 🏠 Home & Timeline
| Dashboard | Timeline View | Post Options |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/991da5f5-6ca4-483e-80a1-29e54c9f9a45" height="400" /> | <img src="https://github.com/user-attachments/assets/f2f9b742-0237-47c4-b1b1-972fd7e69435" height="400" /> | <img src="https://github.com/user-attachments/assets/8b644d61-93e7-4f35-8fd9-3f5bdeab7ec6" height="400" /> |

| Cloud Sync | Gallery Save |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/120547dc-3a5e-4672-a475-a3508a71b190" height="400" /> | <img src="https://github.com/user-attachments/assets/d9a595c1-8224-4d05-ae3e-96b8c48e56f0" height="400" /> |

---

### ✍️ Content Creation (Add New Entry)
| Form Top | Form Bottom |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/ae9d88fd-5f7c-4716-830c-de9413604ca0" height="400" /> | <img src="https://github.com/user-attachments/assets/afb6ec14-cc25-4763-b507-a09b6e0e87bd" height="400" /> |

---

### 🌍 Discovery & Map
| Global Feed | Map Clusters | Location Details | Augmented Reality |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/46960c69-af0b-4ef9-b8aa-90a1849c335d" height="350" /> | <img src="https://github.com/user-attachments/assets/a0fa2575-f487-4a28-ba40-22a6521d2a4f" height="350" /> | <img src="https://github.com/user-attachments/assets/5737349e-42c5-45a0-a9f7-634ba03a8429" height="350" /> | <img src="https://github.com/user-attachments/assets/9d3d734c-037c-4115-a8e5-489803d9f8c9" height="350" /> |

---

### 🛂 Traveler Passport & Profile
| Passport Main | Passport Stats | Profile View |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/5fd66f4e-5af3-45b5-b2a7-f2045b5cb77e" height="400" /> | <img src="https://github.com/user-attachments/assets/d1f1fccb-9362-412c-8bff-3fb0417cfe65" height="400" /> | <img src="https://github.com/user-attachments/assets/3c3251b3-1d57-4afe-90bc-5f5c9bd2a679" height="400" /> |

---

### ⚙️ Settings & Preferences
| Edit Profile | Privacy Controls | Travel Preferences |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/4668d883-f392-43ca-8eb4-c1ef1ee3ac05" height="400" /> | <img src="https://github.com/user-attachments/assets/6b176eca-3cd6-4d27-87cf-b703827f55fa" height="400" /> | <img src="https://github.com/user-attachments/assets/6ca4ca90-b6f7-4242-b1fe-daebfe4f3f0e" height="400" /> |











  





**Created with ❤️ by Dilini**


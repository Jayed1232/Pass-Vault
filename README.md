# 🔐 Pass-Vault

**Pass-Vault** is a super lightweight, mobile-first, and completely offline Progressive Web App (PWA) designed to securely store and manage your most critical access credentials. Built specifically for high-efficiency asset tracking across multiple platforms.

Developed by **Jayed Arman**.

---

## 🚀 Features

* **100% Offline & Private:** Your data never touches an external server. Everything is safely preserved inside your device's secured local storage interface (`localStorage`).
* **Android-First Fluid Interface:** Smooth, high-contrast dark mode tailored perfectly for smartphones, tablets, and desktop viewports.
* **Targeted Categorization:** Dedicated filtering sections built specifically for:
    * 📱 **Devices:** Store lockscreen PINs, patterns, and hardware models.
    * 💬 **Accounts:** Management for Google, Telegram, X (Twitter), Messenger chat restore pins, etc.
    * 🎮 **Games:** Track custom game accounts and platform tags.
    * 🪙 **Crypto & Wallets:** Keep track of Binance, Coinbase, Bitget, and Telegram wallet credentials.
* **2FA Multi-Line Backup Codes:** Built-in multi-slot layout to store the emergency one-time 8-digit or 10-digit backup codes provided by Google or Facebook.
* **Privacy Masking:** Passwords stay hidden under a secure text blur until you tap them to reveal.
* **Instant Local ZIP Backup:** Compile and download your entire credentials manifest into a localized `.zip` archive on-demand to safely upload or sync with your cloud drive manually.
* **One-Touch PWA Installation:** Features an active Service Worker routine that triggers a clean bottom-banner installation prompt on Android devices for immediate home-screen deployment.

---

## 🛠️ Tech Stack

* **Frontend:** Semantic HTML5, CSS3 Custom Properties (Fluid Flexbox structure)
* **Logic:** Native Vanilla JavaScript (ES6+)
* **PWA Layer:** Service Worker API caching, Web App Manifest criteria
* **Compression:** JSZip engine integration (completely client-side execution)

---

## 📦 Local Deployment & Installation

1. Clone or download this repository.
2. Host the root folder using any standard HTTPS web server framework (like **GitHub Pages**).
3. Open the link on your Android device via Chrome.
4. Tap the **"Install Pass-Vault"** banner sliding up from the bottom to pin it as a standalone app!

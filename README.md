<div align="right">
  <details>
    <summary>🌐 Idioma</summary>
    <div align="center">
      English | Español | Français | Deutsch | Português | 中文 | 日本語
    </div>
  </details>
</div>

# 🎶 OpenSpot Music

<p align="center">
 <img width="100" src="https://github.com/user-attachments/assets/9f56500d-d950-48c6-a362-bcbc74be88cb" />
</p>

<h3 align="center">Tu acceso a música ilimitada - Streaming multiplataforma</h3>

<p align="center">
  <strong>Escucha y descarga música en alta calidad gratis, sin anuncios y sin necesidad de iniciar sesión.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/BlackHatDevX/openspot-music-app?style=for-the-badge" />
  <img src="https://img.shields.io/github/forks/BlackHatDevX/openspot-music-app?style=for-the-badge" />
  <img src="https://img.shields.io/github/issues/BlackHatDevX/openspot-music-app?style=for-the-badge" />
</p>

---

## 📱🖥️ Dos aplicaciones en un solo repositorio

Este proyecto incluye **dos apps completas de streaming musical**:

### 🎵 OpenSpot Mobile (React Native + Expo)
- 📱 Plataforma: Android / iOS (en progreso)
- 📂 Carpeta: `openspot-music-mobile/`
- 🚀 Experiencia nativa optimizada para móviles
- 💾 Descargas offline y reproducción en segundo plano

### 🖥️ OpenSpot Desktop (Electron + React)
- 💻 Plataforma: macOS / Windows / Linux (en progreso)
- 📂 Carpeta: `openspot-music-electron/`
- 🎛️ Controles globales de audio
- 💾 Almacenamiento local y gestión de ventanas

---

## ✨ Características principales

- 🎵 Streaming de música en alta calidad  
- 💾 Descarga de canciones para uso offline  
- ❤️ Sistema de favoritos (likes)  
- 🔄 Reproducción en segundo plano  
- 🚫 Sin registro ni inicio de sesión  
- 🎨 Interfaz moderna y adaptable  
- 📦 Persistencia de datos (historial y favoritos)  
- 🆓 Totalmente gratis y sin anuncios  

---

## 📱 App Móvil

### 🔧 Instalación

```bash
cd openspot-music-app/openspot-music-mobile
npm install
npx expo start
📦 Build
# Desarrollo
eas build --platform android --profile development

# APK
eas build --platform android --profile preview

# Producción
eas build --platform android --profile production
🖥️ App de Escritorio
🔧 Instalación
cd openspot-music-app/openspot-music-electron
npm install
npm run electron-dev
📦 Build
npm run build
npm run electron-pack
🛠️ Tecnologías utilizadas
Mobile
React Native + Expo
Expo Router
Expo AV
Desktop
Electron
React
Material UI
General
TypeScript
npm / yarn
⚙️ Configuración

Este proyecto requiere variables de entorno:

Copia el archivo:
.env.template
Renómbralo a:
.env
Completa los valores necesarios.
🚀 Inicio rápido
Mobile
git clone https://github.com/BlackHatDevX/openspot-music-app.git
cd openspot-music-app/openspot-music-mobile
npm install
npx expo start
Desktop
git clone https://github.com/BlackHatDevX/openspot-music-app.git
cd openspot-music-app/openspot-music-electron
npm install
npm run electron-dev
👤 Autor

Isai Reyes

GitHub: https://github.com/isairey
🤝 Contribuciones

Las contribuciones son bienvenidas. Puedes:

Reportar bugs
Proponer mejoras
Enviar pull requests
📄 Licencia

Este proyecto está bajo la licencia MIT.

# 🐉 Capsule Corp - Dragon Radar System ⚡

![Capsule Corp Banner](https://img.shields.io/badge/CAPSULE_CORP-RADAR_SYSTEM_v2.5-orange?style=for-the-badge&logo=dragonball)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

> **Aplicación Web Telemétrica e Interactiva** desarrollada con **Django** y **Leaflet.js**, ambientada en la temática futurista de **Dragon Ball Z / Capsule Corp**. Incluye trazado de rutas en tiempo real, autocompletado de direcciones para Popayán, detector de ki/sismos global (USGS API), centro multimedia y un visor de documentos PDF interactivo.

---

## 🌐 Demo en Vivo

🚀 **Prueba la aplicación desplegada en Render:**  
👉 [https://dragon-radar-capsule-corp.onrender.com](https://dragon-radar-capsule-corp.onrender.com)

---

## ⚡ Características Principales

### 🗺️ 1. Radar del Dragón (Mapa Interactivo & Rutas)
* **Trazado de Rutas en Tiempo Real:** Integración con **Leaflet** y **Leaflet Routing Machine** para calcular distancia (km) y tiempo estimado de viaje.
* **Autocompletado de Direcciones:** Búsqueda predictiva con **Awesomplete** conectada a la API de **Nominatim (OpenStreetMap)** optimizada para **Popayán, Cauca, Colombia**.
* **Esferas del Dragón Dinámicas:** Generación de marcadores personalizados con esferas de 1 a 7 estrellas de forma aleatoria al recalcular rutas o arrastrar marcadores.

### 🎬 2. Centro Multimedia Capsule Corp
* Reproductor personalizado para contenido audiovisual local en formatos MP4 y MP3.

### 📄 3. Visor de Documentos (PDF.js)
* **Lector Nativo en Canvas:** Implementación del motor oficial de Mozilla **PDF.js** para renderizar documentos sin bloqueos de navegador.
* **Carga Local de Archivos:** Permite al usuario cargar cualquier archivo PDF desde su computador para leerlo al instante.
* **Modo Pantalla Completa & Navegación:** Botones para cambiar de página y vista expandida en pantalla completa (`Fullscreen API`).

### 🌍 4. Detector de Ki (Monitoreo Sísmico en Tiempo Real)
* **Consumo de API de la USGS:** Rastreos tectónicos globales actualizados al minuto.
* **Diseño en Tarjetas & Traducido al Español:** Indicadores con insignias de colores (Verde, Amarillo, Rojo) y emojis según la magnitud.
* **Ficha Técnica Flotante (Modal):** Información detallada sobre profundidad, coordenadas, horario y alertas de tsunami al hacer clic.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Python 3.10+, Django 5.x, Gunicorn.
* **Frontend:** HTML5, CSS3 (Efectos Neón, Flexbox, CSS Grid), JavaScript (ES6+).
* **Mapeo & Geolocalización:** Leaflet.js, Leaflet Routing Machine, OpenStreetMap / CartoDB.
* **Visor de PDF:** PDF.js (Mozilla).
* **Autocompletado:** Awesomplete.js.
* **APIs Externas:** Nominatim OpenStreetMap API, USGS Earthquake Hazards Program API.
* **Despliegue:** Render.

---

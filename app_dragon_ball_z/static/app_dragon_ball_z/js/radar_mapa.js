document.addEventListener('DOMContentLoaded', function () {
    // Inicializar mapa centrado en Popayán
    var map = L.map('map', { zoomControl: false }).setView([2.4419, -76.6063], 14);

    // Servidor de mapas OSM totalmente libre de bloqueos 403
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
    }).addTo(map);

    var controlRuta = null;

    // Flecha Roja para el Origen
    var iconoOrigen = L.divIcon({
        className: 'custom-radar-arrow',
        html: '<div style="width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:20px solid #ff0000; filter:drop-shadow(0 0 6px #ff0000); transform:rotate(45deg);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Generar esferas del dragón aleatorias (1 a 7 estrellas)
    function generarIconoEsferaAleatorio() {
        var estrellasNum = Math.floor(Math.random() * 7) + 1;
        var estrellasTexto = '★'.repeat(estrellasNum);
        
        return L.divIcon({
            className: 'custom-dragon-ball',
            html: `<div style="background: radial-gradient(circle at 30% 30%, #ffee55, #ff8800); border: 2px solid #b34700; width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 0 12px #ffaa00; display: flex; align-items: center; justify-content: center; color: #cc0000; font-size: 8px; font-weight: bold; letter-spacing: -2px; text-shadow: 0 0 2px #fff;">${estrellasTexto}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });
    }

    var origenMarker = L.marker([2.4419, -76.6063], { draggable: true, icon: iconoOrigen }).addTo(map);
    var destinoMarker = L.marker([2.4500, -76.6000], { draggable: true, icon: generarIconoEsferaAleatorio() }).addTo(map);

    // Configurar Autocompletado con Awesomplete
    function configurarAutocompletado(inputId, marker) {
        var inputElem = document.getElementById(inputId);
        if (!inputElem) return;
        var awesomplete = new Awesomplete(inputElem, { minChars: 3, maxItems: 5 });

        inputElem.addEventListener('input', function() {
            var val = inputElem.value;
            if (val.length >= 3) {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ' Popayán Cauca')}`)
                    .then(res => res.json())
                    .then(data => {
                        var lista = data.map(item => item.display_name);
                        awesomplete.list = lista;
                    })
                    .catch(() => {});
            }
        });

        inputElem.addEventListener('awesomplete-selectcomplete', function(e) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.text.value)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        var lat = parseFloat(data[0].lat);
                        var lon = parseFloat(data[0].lon);
                        marker.setLatLng([lat, lon]);
                        if (inputId === 'destino-input') {
                            marker.setIcon(generarIconoEsferaAleatorio());
                        }
                        actualizarRuta();
                    }
                })
                .catch(() => {});
        });
    }

    configurarAutocompletado('origen-input', origenMarker);
    configurarAutocompletado('destino-input', destinoMarker);

    function obtenerDireccion(lat, lng, inputId) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.display_name) {
                    var partes = data.display_name.split(',');
                    var dirCorta = partes[0] + (partes[1] ? ',' + partes[1] : '');
                    document.getElementById(inputId).value = dirCorta;
                }
            })
            .catch(() => {});
    }

    function actualizarRuta() {
        var p1 = origenMarker.getLatLng();
        var p2 = destinoMarker.getLatLng();

        if (controlRuta) {
            map.removeControl(controlRuta);
        }

        controlRuta = L.Routing.control({
            waypoints: [p1, p2],
            routeWhileDragging: true,
            language: 'es',
            show: false,
            createMarker: function() { return null; },
            lineOptions: {
                styles: [{ color: '#ff7700', opacity: 0.95, weight: 6 }]
            }
        }).on('routesfound', function(e) {
            var summary = e.routes[0].summary;
            var distKm = (summary.totalDistance / 1000).toFixed(2);
            var tiempoMin = Math.round(summary.totalTime / 60);

            document.getElementById('stat-distancia').innerText = distKm + " km";
            document.getElementById('stat-tiempo').innerText = tiempoMin + " min";
            document.getElementById('stat-trafico').innerText = "Normal (Despejado)";
        }).addTo(map);
    }

    origenMarker.on('dragend', function() {
        var pos = origenMarker.getLatLng();
        obtenerDireccion(pos.lat, pos.lng, 'origen-input');
        actualizarRuta();
    });

    destinoMarker.on('dragend', function() {
        var pos = destinoMarker.getLatLng();
        destinoMarker.setIcon(generarIconoEsferaAleatorio());
        obtenerDireccion(pos.lat, pos.lng, 'destino-input');
        actualizarRuta();
    });

    actualizarRuta();

    window.buscarYRecalcular = function() {
        var dirOrigen = document.getElementById('origen-input').value;
        var dirDestino = document.getElementById('destino-input').value;

        if (dirOrigen) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dirOrigen + ' Popayán Cauca')}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        origenMarker.setLatLng([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        actualizarRuta();
                    }
                })
                .catch(() => {});
        }

        if (dirDestino) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dirDestino + ' Popayán Cauca')}`)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0) {
                        destinoMarker.setLatLng([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        destinoMarker.setIcon(generarIconoEsferaAleatorio());
                        actualizarRuta();
                    }
                })
                .catch(() => {});
        }
    };

    window.invalidateMapSize = function() {
        setTimeout(function() { map.invalidateSize(); }, 200);
    };

  // Cargar y traducir Sismos de USGS en tiempo real
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
        .then(res => res.json())
        .then(data => {
            var grid = document.getElementById('sismos-grid');
            if (!grid) return;
            grid.innerHTML = '';

            // Guardar datos en memoria global para el modal
            window.listaSismos = data.features;

            data.features.slice(0, 9).forEach((sismo, index) => {
                var p = sismo.properties;
                var fecha = new Date(p.time).toLocaleString('es-CO');
                var mag = p.mag ? p.mag.toFixed(1) : 'N/A';
                
                // Traducir direcciones comunes de la API
                var lugar = p.place || 'Ubicación Desconocida';
                lugar = lugar
                    .replace(/km/g, 'km')
                    .replace(/NW of/g, 'al Noroeste de')
                    .replace(/SE of/g, 'al Sureste de')
                    .replace(/NE of/g, 'al Noreste de')
                    .replace(/SW of/g, 'al Suroeste de')
                    .replace(/N of/g, 'al Norte de')
                    .replace(/S of/g, 'al Sur de')
                    .replace(/E of/g, 'al Este de')
                    .replace(/W of/g, 'al Oeste de')
                    .replace(/CA/g, 'California')
                    .replace(/Chile/g, 'Chile')
                    .replace(/Mexico/g, 'México');

                grid.innerHTML += `
                    <div class="stat-box" style="margin: 0; cursor: pointer; transition: transform 0.2s; border-color: rgba(255,119,0,0.5);" onclick="mostrarModalSismo(${index})">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="background: var(--orange-dragon); color: #000; font-weight: bold; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">
                                ⚡ Mag ${mag}
                            </span>
                            <small style="color: #94a3b8;">🕒 ${fecha.split(',')[1]}</small>
                        </div>
                        <p style="font-size: 0.95rem; margin: 5px 0; color: #fff;">📍 ${lugar}</p>
                        <div style="color: var(--blue-capsule); font-size: 0.8rem; text-align: right; margin-top: 8px;">
                            🔍 Click para ver detalles ▶
                        </div>
                    </div>
                `;
            });
        })
        .catch(err => {
            var grid = document.getElementById('sismos-grid');
            if (grid) grid.innerHTML = '<div style="color: #ef4444;">⚠️ Error al conectar con la red de sensores telemétricos.</div>';
        });

    // Función para desplegar la tarjeta/modal con la información completa
    window.mostrarModalSismo = function(index) {
        var sismo = window.listaSismos[index];
        if (!sismo) return;

        var p = sismo.properties;
        var coords = sismo.geometry.coordinates;
        var fecha = new Date(p.time).toLocaleString('es-CO');

        var lugar = p.place || 'Ubicación Desconocida';
        lugar = lugar
            .replace(/NW of/g, 'al Noroeste de')
            .replace(/SE of/g, 'al Sureste de')
            .replace(/NE of/g, 'al Noreste de')
            .replace(/SW of/g, 'al Suroeste de')
            .replace(/N of/g, 'al Norte de')
            .replace(/S of/g, 'al Sur de')
            .replace(/E of/g, 'al Este de')
            .replace(/W of/g, 'al Oeste de')
            .replace(/CA/g, 'California');

        var contenido = `
            <p>💥 <b>Magnitud:</b> <span style="color: var(--yellow-dragon); font-size: 1.2rem; font-weight: bold;">${p.mag} ML</span></p>
            <p>📍 <b>Ubicación:</b> ${lugar}</p>
            <p>🕒 <b>Fecha y Hora:</b> ${fecha}</p>
            <p>🌊 <b>Profundidad:</b> ${coords[2]} km</p>
            <p>🌐 <b>Coordenadas:</b> Lat: ${coords[1]}, Lon: ${coords[0]}</p>
            <p>⚠️ <b>Alerta de Tsunami:</b> ${p.tsunami === 1 ? '🔴 ACTIVADA' : '🟢 Sin Riesgo'}</p>
            <p>📊 <b>Estatus:</b> ${p.status === 'reviewed' ? 'Revisado por Sismólogos' : 'En Procesamiento'}</p>
        `;

        document.getElementById('modal-contenido').innerHTML = contenido;
        document.getElementById('sismo-modal').style.display = 'flex';
    };

    window.cerrarModalSismo = function() {
        document.getElementById('sismo-modal').style.display = 'none';
    };


// Cargar y diseñar Sismos de USGS en tiempo real con emojis e íconos visuales
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
.then(res => res.json())
.then(data => {
    var grid = document.getElementById('sismos-grid');
    if (!grid) return;
    grid.innerHTML = '';

    window.listaSismos = data.features;

    data.features.slice(0, 9).forEach((sismo, index) => {
        var p = sismo.properties;
        var fecha = new Date(p.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        var magVal = p.mag ? parseFloat(p.mag.toFixed(1)) : 0;
        
        // Determinar nivel de alerta, emoji y color según magnitud
        var badgeBg = '#22c55e'; // Verde
        var emojiAlerta = '🟢🍃';
        var nivelTexto = 'Leve';

        if (magVal >= 4.5) {
            badgeBg = '#ef4444'; // Rojo
            emojiAlerta = '🔴🚨';
            nivelTexto = '¡CRÍTICO!';
        } else if (magVal >= 3.0) {
            badgeBg = '#eab308'; // Amarillo
            emojiAlerta = '🟡⚠️';
            nivelTexto = 'Moderado';
        }

        // Traducir direcciones
        var lugar = p.place || 'Ubicación Desconocida';
        lugar = lugar
            .replace(/km/g, 'km')
            .replace(/NW of/g, 'al NO de')
            .replace(/SE of/g, 'al SE de')
            .replace(/NE of/g, 'al NE de')
            .replace(/SW of/g, 'al SO de')
            .replace(/N of/g, 'al Norte de')
            .replace(/S of/g, 'al Sur de')
            .replace(/E of/g, 'al Este de')
            .replace(/W of/g, 'al Oeste de')
            .replace(/CA/g, 'California 🇺🇸')
            .replace(/Chile/g, 'Chile 🇨🇱')
            .replace(/Mexico/g, 'México 🇲🇽')
            .replace(/Alaska/g, 'Alaska 🧊');

        grid.innerHTML += `
            <div class="sismo-card-item" onclick="mostrarModalSismo(${index})" style="background: rgba(15, 23, 42, 0.85); border: 2px solid ${badgeBg}; border-radius: 12px; padding: 15px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.4); position: relative; overflow: hidden;">
                
                <!-- Encabezado de la Tarjeta -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="background: ${badgeBg}; color: #000; font-weight: 800; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; box-shadow: 0 0 8px ${badgeBg};">
                        ${emojiAlerta} Mag ${magVal} (${nivelTexto})
                    </span>
                    <span style="color: #94a3b8; font-size: 0.8rem; font-weight: bold;">🕒 ${fecha}</span>
                </div>

                <!-- Detalle de Ubicación -->
                <p style="font-size: 0.92rem; margin: 8px 0; color: #f8fafc; font-weight: 600; line-height: 1.3;">
                    📍 ${lugar}
                </p>

                <!-- Pie de la Tarjeta con Ícono -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                    <span style="font-size: 0.75rem; color: #cbd5e1;">⚡ Profundidad: ${sismo.geometry.coordinates[2]} km</span>
                    <span style="color: var(--yellow-dragon); font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                        🔍 Ver Ficha ➔
                    </span>
                </div>
            </div>
        `;
    });
})
.catch(() => {
    var grid = document.getElementById('sismos-grid');
    if (grid) grid.innerHTML = '<div style="color: #ef4444; font-weight: bold;">⚠️ Error al conectar con la red de sensores de Capsule Corp.</div>';
});

// Función para desplegar la tarjeta/modal con la información completa
window.mostrarModalSismo = function(index) {
var sismo = window.listaSismos[index];
if (!sismo) return;

var p = sismo.properties;
var coords = sismo.geometry.coordinates;
var fecha = new Date(p.time).toLocaleString('es-CO');

var lugar = p.place || 'Ubicación Desconocida';
lugar = lugar
    .replace(/NW of/g, 'al Noroeste de')
    .replace(/SE of/g, 'al Sureste de')
    .replace(/NE of/g, 'al Noreste de')
    .replace(/SW of/g, 'al Suroeste de')
    .replace(/N of/g, 'al Norte de')
    .replace(/S of/g, 'al Sur de')
    .replace(/E of/g, 'al Este de')
    .replace(/W of/g, 'al Oeste de')
    .replace(/CA/g, 'California');

var contenido = `
    <p>💥 <b>Magnitud:</b> <span style="color: var(--yellow-dragon); font-size: 1.2rem; font-weight: bold;">${p.mag} ML</span></p>
    <p>📍 <b>Ubicación:</b> ${lugar}</p>
    <p>🕒 <b>Fecha y Hora:</b> ${fecha}</p>
    <p>🌊 <b>Profundidad:</b> ${coords[2]} km</p>
    <p>🌐 <b>Coordenadas:</b> Lat: ${coords[1]}, Lon: ${coords[0]}</p>
    <p>⚠️ <b>Alerta de Tsunami:</b> ${p.tsunami === 1 ? '🔴 ACTIVADA' : '🟢 Sin Riesgo'}</p>
    <p>📊 <b>Estatus:</b> ${p.status === 'reviewed' ? 'Revisado por Sismólogos' : 'En Procesamiento'}</p>
`;

document.getElementById('modal-contenido').innerHTML = contenido;
document.getElementById('sismo-modal').style.display = 'flex';
};

window.cerrarModalSismo = function() {
document.getElementById('sismo-modal').style.display = 'none';
};
        function cargarPdfLocal(event) {
            var file = event.target.files[0];
            if (file && file.type === "application/pdf") {
                var fileURL = URL.createObjectURL(file);
                
                var viewer = document.getElementById('pdf-viewer');
                var downloadBtn = document.getElementById('pdf-download-btn');
        
                viewer.src = fileURL;
                downloadBtn.href = fileURL;
                downloadBtn.setAttribute('download', file.name);
            } else {
                alert("Por favor selecciona un archivo PDF válido.");
            }
        }

        function togglePantallaCompleta() {
            var elem = document.getElementById('pdf-canvas-container');
            if (!elem) return;
        
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }

// Actualizar la lista de sismos automáticamente cada 30 segundos
setInterval(function() {
    if (document.getElementById('sismos-grid')) {
        // Ejecuta la función de recarga en segundo plano
        cargarSismosTiempoReal();
    }
}, 30000);
});
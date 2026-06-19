document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const magnifier = document.getElementById('magnifier');
    const magnifierBtn = document.getElementById('magnifier-btn');
    const canvasContainer = document.getElementById('canvas-container');
    const colorCanvas = document.getElementById('color-canvas');
    const palette = document.getElementById('palette');
    const customColorPicker = document.getElementById('custom-color');
    const resetBtn = document.getElementById('reset-btn');
    const rgbValues = document.getElementById('rgb-values');
    
    // Subpíxeles de la lupa
    const subpixelRed = magnifier.querySelector('.subpixel.red');
    const subpixelGreen = magnifier.querySelector('.subpixel.green');
    const subpixelBlue = magnifier.querySelector('.subpixel.blue');

    let magnifierActive = false;
    let currentColor = { r: 255, g: 0, b: 0 }; // Rojo por defecto

    // Paleta de colores educativos sugeridos
    const defaultColors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
        '#00FFFF', '#FF00FF', '#FFFFFF', '#808080',
        '#FFA500', '#4B0082', '#8B4513', '#000000'
    ];

    // 1. Inicializar Paleta Dinámica
    function initPalette() {
        palette.innerHTML = '';
        defaultColors.forEach((color, index) => {
            const sample = document.createElement('div');
            sample.classList.add('color-sample');
            sample.style.backgroundColor = color;
            if(index === 0) sample.classList.add('selected'); // Rojo inicial
            
            sample.addEventListener('click', () => {
                document.querySelectorAll('.color-sample').forEach(s => s.classList.remove('selected'));
                sample.classList.add('selected');
                updateCanvasColor(color);
            });
            palette.appendChild(sample);
        });
    }

    // 2. Actualizar el color del Canvas y procesar su RGB
    function updateCanvasColor(hex) {
        colorCanvas.style.backgroundColor = hex;
        customColorPicker.value = hex;
        currentColor = hexToRgb(hex);
        updateMagnifierLeds();
    }

    // Auxiliar: Convertir HEX a Objeto RGB numérico
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // 3. Modificar dinámicamente la intensidad de los subpíxeles LED
    function updateMagnifierLeds() {
        // Mostrar los valores numéricos arriba
        rgbValues.textContent = `R: ${currentColor.r} | G: ${currentColor.g} | B: ${currentColor.b}`;

        // Normalizar los valores a escala 0-1 para la opacidad y brillo físico
        const opacityR = Math.max(0.05, currentColor.r / 255);
        const opacityG = Math.max(0.05, currentColor.g / 255);
        const opacityB = Math.max(0.05, currentColor.b / 255);

        subpixelRed.style.opacity = opacityR;
        subpixelRed.style.filter = `brightness(${opacityR * 1.5})`;

        subpixelGreen.style.opacity = opacityG;
        subpixelGreen.style.filter = `brightness(${opacityG * 1.5})`;

        subpixelBlue.style.opacity = opacityB;
        subpixelBlue.style.filter = `brightness(${opacityB * 1.5})`;
    }

    // 4. Lógica de Activación de Lupa
    magnifierBtn.addEventListener('click', () => {
        magnifierActive = !magnifierActive;
        if (magnifierActive) {
            magnifierBtn.textContent = "Desactivar Lupa";
            magnifierBtn.classList.add('active');
        } else {
            magnifierBtn.textContent = "Activar Lupa";
            magnifierBtn.classList.remove('active');
            magnifier.classList.add('hidden');
        }
    });

    // 5. Seguimiento del cursor / hover sobre el panel
    function moveMagnifier(e) {
        if (!magnifierActive) return;

        // Mostrar la lupa cuando entra al área reactiva
        magnifier.classList.remove('hidden');

        // Obtener coordenadas del cliente (soporte mouse y touch simultáneo)
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (!clientX || !clientY) return;

        // Centrar perfectamente el círculo en el puntero (ajustado para móvil y desktop)
        const isMobile = window.innerWidth <= 768;
        const offset = isMobile ? 65 : 80; // Mitad del tamaño de la lupa según CSS

        magnifier.style.left = `${clientX - offset}px`;
        magnifier.style.top = `${clientY - offset}px`;
    }

    // Eventos para mover la lupa
    canvasContainer.addEventListener('mousemove', moveMagnifier);
    
    // Evento táctil con bloqueo de scroll nativo para que ande joya en smartphones
    canvasContainer.addEventListener('touchmove', (e) => {
        if (magnifierActive) {
            e.preventDefault(); // Clava la pantalla en su lugar para evitar el "drag-to-refresh" o scroll
            moveMagnifier(e);
        }
    }, { passive: false });

    // Ocultar la lupa si el cursor sale del panel educativo
    canvasContainer.addEventListener('mouseleave', () => {
        magnifier.classList.add('hidden');
    });
    canvasContainer.addEventListener('touchend', () => {
        magnifier.classList.add('hidden');
    });

    // 6. Color Personalizado (Input nativo)
    customColorPicker.addEventListener('input', (e) => {
        document.querySelectorAll('.color-sample').forEach(s => s.classList.remove('selected'));
        updateCanvasColor(e.target.value);
    });

    // 7. Botón de Reinicio (Vuelve a estado base Rojo)
    resetBtn.addEventListener('click', () => {
        magnifierActive = false;
        magnifierBtn.textContent = "Activar Lupa";
        magnifierBtn.classList.remove('active');
        magnifier.classList.add('hidden');
        initPalette();
        updateCanvasColor('#FF0000');
    });

    // Arrancar la app por primera vez
    initPalette();
    updateCanvasColor('#FF0000');
});
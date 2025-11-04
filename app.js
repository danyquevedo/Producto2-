// ===================================================
// === UTILERÍA: Transformador de Coordenadas ===
// ===================================================
class TransformadorCoordenadas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.escala = 30; // 1 unidad cartesiana = 30 píxeles
    }

    // Convierte coordenadas cartesianas (centro 0,0) a coordenadas Canvas (arriba-izq 0,0)
    toCanvas(x, y) {
        return {
            x: this.centerX + x * this.escala,
            y: this.centerY - y * this.escala // El eje Y se invierte
        };
    }

    // Convierte coordenadas Canvas a cartesianas (útil para eventos de mouse)
    toCartesian(cx, cy) {
        return {
            x: (cx - this.centerX) / this.escala,
            y: (this.centerY - cy) / this.escala
        };
    }
}


// ===================================================
// === CLASES POO: Punto, Vector, PlanoCartesiano ===
// ===================================================

class Punto {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    dibujar(ctx, transformer) {
        const { x: cx, y: cy } = transformer.toCanvas(this.x, this.y);

        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#FF6B6B"; 
        ctx.fill();
        ctx.closePath();
    }
}

class Vector {
    constructor(origen, fin) {
        this.origen = origen; 
        this.fin = fin;
    }

    dibujar(ctx, transformer) {
        const { x: x1, y: y1 } = transformer.toCanvas(this.origen.x, this.origen.y);
        const { x: x2, y: y2 } = transformer.toCanvas(this.fin.x, this.fin.y);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const ang = Math.atan2(dy, dx);
        const arrowLength = 12;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#8effc1"; 
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Flecha
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowLength * Math.cos(ang - Math.PI / 6),
                   y2 - arrowLength * Math.sin(ang - Math.PI / 6));
        ctx.lineTo(x2 - arrowLength * Math.cos(ang + Math.PI / 6),
                   y2 - arrowLength * Math.sin(ang + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = "#8effc1"; 
        ctx.fill();
    }
}

class PlanoCartesiano {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.puntos = [];
        this.vectores = [];
        this.transformer = new TransformadorCoordenadas(this.canvas.width, this.canvas.height);
        this.dibujar();
    }

    dibujarEjesYRejilla() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        const { centerX, centerY, escala } = this.transformer;

        ctx.clearRect(0, 0, width, height);

        // --- Rejilla (Líneas menores y mayores) ---
        ctx.lineWidth = 0.5;

        // Verticales (eje X)
        for (let x = 0; x < width; x += escala / 2) {
            ctx.beginPath();
            // Colores más oscuros para la rejilla en modo oscuro
            ctx.strokeStyle = (x === centerX) ? "#546de5" : (x % escala === 0) ? "#404b69" : "#353a50";
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontales (eje Y)
        for (let y = 0; y < height; y += escala / 2) {
            ctx.beginPath();
            // Colores más oscuros para la rejilla en modo oscuro
            ctx.strokeStyle = (y === centerY) ? "#546de5" : (y % escala === 0) ? "#404b69" : "#353a50";
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // --- Ejes Principales (Líneas más gruesas) ---
        ctx.strokeStyle = "#00f2fe"; // Azul neón para ejes
        ctx.lineWidth = 1.5;

        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Eje Y
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
    }

    agregarPunto(p) {
        this.puntos.push(p);
        this.dibujar();
    }

    agregarVector(v) {
        this.vectores.push(v);
        this.dibujar();
    }

    limpiar() {
        this.puntos = [];
        this.vectores = [];
        this.dibujar();
    }

    dibujar() {
        this.dibujarEjesYRejilla();
        this.puntos.forEach(p => p.dibujar(this.ctx, this.transformer));
        this.vectores.forEach(v => v.dibujar(this.ctx, this.transformer));
    }
}

// ===================================================
// === Inicialización y Eventos ===
// ===================================================
const plano = new PlanoCartesiano("plano");

const parsePointInput = (xId, yId) => {
    const x = parseFloat(document.getElementById(xId).value);
    const y = parseFloat(document.getElementById(yId).value);
    if (isNaN(x) || isNaN(y)) {
        alert("⚠️ Ingresa coordenadas X e Y válidas.");
        throw new Error("Coordenadas no válidas");
    }
    return new Punto(x, y);
};

const parseVectorInput = (inputId) => {
    const [x, y] = document.getElementById(inputId).value.split(",").map(s => parseFloat(s.trim()));
    if (isNaN(x) || isNaN(y)) {
        alert("⚠️ Ingresa coordenadas de origen/fin válidas (formato: x,y).");
        throw new Error("Coordenadas de vector no válidas");
    }
    return new Punto(x, y);
};

document.getElementById("addPoint").addEventListener("click", () => {
    try {
        const punto = parsePointInput("x", "y");
        plano.agregarPunto(punto);
    } catch (e) {
        // Manejo de error silencioso
    }
});

document.getElementById("addVector").addEventListener("click", () => {
    try {
        const origen = parseVectorInput("origen");
        const fin = parseVectorInput("fin");
        plano.agregarVector(new Vector(origen, fin));
    } catch (e) {
        // Manejo de error silencioso
    }
});

document.getElementById("clear").addEventListener("click", () => plano.limpiar());

document.getElementById("startBtn").addEventListener("click", () => {
    const welcome = document.getElementById("welcome-screen");
    welcome.style.opacity = "0";
    setTimeout(() => welcome.style.display = "none", 1000);
});
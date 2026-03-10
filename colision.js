const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Ajustar canvas al tamaño de la ventana
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speedX, speedY) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;

        // Color original y color actual
        this.originalColor = color;
        this.color = color;

        this.text = text;

        // Velocidades independientes en X y Y
        this.dx = speedX;
        this.dy = speedY;

        // Estado de colisión
        this.isColliding = false;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        // Texto al centro
        context.beginPath();
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "16px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.closePath();
    }

    move() {
        this.posX += this.dx;
        this.posY += this.dy;
    }

    checkWallCollision(canvasWidth, canvasHeight) {
        // Rebote horizontal
        if (this.posX + this.radius >= canvasWidth || this.posX - this.radius <= 0) {
            this.dx = -this.dx;
        }

        // Rebote vertical
        if (this.posY + this.radius >= canvasHeight || this.posY - this.radius <= 0) {
            this.dy = -this.dy;
        }
    }

    // Fórmula de distancia entre centros
    getDistance(otherCircle) {
        const dx = otherCircle.posX - this.posX;
        const dy = otherCircle.posY - this.posY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Determina si está colisionando con otro círculo
    checkCollisionWith(otherCircle) {
        const distance = this.getDistance(otherCircle);
        return distance <= (this.radius + otherCircle.radius);
    }

    setCollisionState(state) {
        this.isColliding = state;
        this.color = state ? "#0000FF" : this.originalColor;
    }

    update(context, canvasWidth, canvasHeight) {
        this.move();
        this.checkWallCollision(canvasWidth, canvasHeight);
        this.draw(context);
    }
}

// Arreglo de círculos
let circles = [];

// Color aleatorio hexadecimal válido
function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

// Número aleatorio entre min y max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Generar valor de velocidad entre 1 y 5, con signo aleatorio
function randomSpeed() {
    let speed = randomBetween(1, 5);
    return Math.random() < 0.5 ? -speed : speed;
}

// Generar círculos
function generateCircles(n) {
    circles = [];

    for (let i = 0; i < n; i++) {
        let radius = randomBetween(20, 45);

        let x = randomBetween(radius, canvas.width - radius);
        let y = randomBetween(radius, canvas.height - radius);

        let color = randomColor();
        let text = (i + 1).toString();

        let speedX = randomSpeed();
        let speedY = randomSpeed();

        circles.push(new Circle(x, y, radius, color, text, speedX, speedY));
    }
}

// Detectar colisiones colectivas entre todos los círculos
function detectCollisions() {
    // Primero, reiniciar estado de colisión
    circles.forEach(circle => {
        circle.setCollisionState(false);
    });

    // Comparar cada círculo con todos los demás
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].checkCollisionWith(circles[j])) {
                circles[i].setCollisionState(true);
                circles[j].setCollisionState(true);
            }
        }
    }
}

// Animación
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectCollisions();

    circles.forEach(circle => {
        circle.update(ctx, canvas.width, canvas.height);
    });

    requestAnimationFrame(animate);
}

// Ajustar al redimensionar ventana
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.background = "#f0f0f0";
});

// Generar 20 círculos
generateCircles(20);
animate();
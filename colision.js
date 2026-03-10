const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;

        this.color = color;
        this.originalColor = color;

        this.text = text;
        this.speed = speed;

        // Dirección inicial aleatoria
        this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed;
        this.dy = (Math.random() < 0.5 ? -1 : 1) * this.speed;

        // Para efecto flash
        this.flashFrames = 0;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillStyle = "#000";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    move() {
        this.posX += this.dx;
        this.posY += this.dy;
    }

    checkBorderCollision() {
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    getDistance(otherCircle) {
        const dx = otherCircle.posX - this.posX;
        const dy = otherCircle.posY - this.posY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isCollidingWith(otherCircle) {
        return this.getDistance(otherCircle) <= (this.radius + otherCircle.radius);
    }

    flashBlue() {
        this.color = "#0000FF";
        this.flashFrames = 6; // dura unos frames en azul
    }

    restoreColor() {
        if (this.flashFrames > 0) {
            this.flashFrames--;
        } else {
            this.color = this.originalColor;
        }
    }

    bounceWith(otherCircle) {
        // Intercambio de velocidades para simular rebote
        let tempDx = this.dx;
        let tempDy = this.dy;

        this.dx = otherCircle.dx;
        this.dy = otherCircle.dy;

        otherCircle.dx = tempDx;
        otherCircle.dy = tempDy;

        // Separación para evitar que se queden encimados
        const dx = otherCircle.posX - this.posX;
        const dy = otherCircle.posY - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const overlap = (this.radius + otherCircle.radius) - distance;
        const unitX = dx / distance;
        const unitY = dy / distance;

        this.posX -= unitX * (overlap / 2);
        this.posY -= unitY * (overlap / 2);

        otherCircle.posX += unitX * (overlap / 2);
        otherCircle.posY += unitY * (overlap / 2);
    }

    update(context) {
        this.move();
        this.checkBorderCollision();
        this.restoreColor();
        this.draw(context);
    }
}

// Crear un array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        let text = (i + 1).toString();

        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Detectar colisiones entre todos los círculos
function handleCircleCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].isCollidingWith(circles[j])) {
                circles[i].flashBlue();
                circles[j].flashBlue();
                circles[i].bounceWith(circles[j]);
            }
        }
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height);

    handleCircleCollisions();

    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate);
}

// Generar 20 círculos y comenzar la animación
generateCircles(20);
animate();
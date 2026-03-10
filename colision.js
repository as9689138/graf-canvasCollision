const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;

        this.color = color;
        this.originalColor = color;

        this.text = text;
        this.speed = speed;

        this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed;
        this.dy = (Math.random() < 0.5 ? -1 : 1) * this.speed;

        this.flashFrames = 0;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "18px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.closePath();
    }

    move() {
        this.posX += this.dx;
        this.posY += this.dy;
    }

    checkBorderCollision(canvasWidth, canvasHeight) {
        if (this.posX + this.radius >= canvasWidth) {
            this.posX = canvasWidth - this.radius;
            this.dx = -this.dx;
        }

        if (this.posX - this.radius <= 0) {
            this.posX = this.radius;
            this.dx = -this.dx;
        }

        if (this.posY + this.radius >= canvasHeight) {
            this.posY = canvasHeight - this.radius;
            this.dy = -this.dy;
        }

        if (this.posY - this.radius <= 0) {
            this.posY = this.radius;
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
        this.flashFrames = 6;
    }

    restoreColor() {
        if (this.flashFrames > 0) {
            this.flashFrames--;
        } else {
            this.color = this.originalColor;
        }
    }

    bounceWith(otherCircle) {
        const tempDx = this.dx;
        const tempDy = this.dy;

        this.dx = otherCircle.dx;
        this.dy = otherCircle.dy;

        otherCircle.dx = tempDx;
        otherCircle.dy = tempDy;

        const dx = otherCircle.posX - this.posX;
        const dy = otherCircle.posY - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return;
        }

        const overlap = (this.radius + otherCircle.radius) - distance;
        const unitX = dx / distance;
        const unitY = dy / distance;

        this.posX -= unitX * (overlap / 2);
        this.posY -= unitY * (overlap / 2);

        otherCircle.posX += unitX * (overlap / 2);
        otherCircle.posY += unitY * (overlap / 2);
    }

    keepInside(canvasWidth, canvasHeight) {
        if (this.posX - this.radius < 0) {
            this.posX = this.radius;
        }

        if (this.posX + this.radius > canvasWidth) {
            this.posX = canvasWidth - this.radius;
        }

        if (this.posY - this.radius < 0) {
            this.posY = this.radius;
        }

        if (this.posY + this.radius > canvasHeight) {
            this.posY = canvasHeight - this.radius;
        }
    }

    update(context, canvasWidth, canvasHeight) {
        this.move();
        this.checkBorderCollision(canvasWidth, canvasHeight);
        this.restoreColor();
        this.draw(context);
    }
}

let circles = [];

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    circles.forEach(circle => {
        circle.keepInside(canvas.width, canvas.height);
    });
}

function randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomPosition(radius, max) {
    return Math.random() * (max - radius * 2) + radius;
}

function generateCircles(n) {
    circles = [];

    for (let i = 0; i < n; i++) {

        let radius = randomBetween(20, 45);
        let x;
        let y;
        let validPosition = false;

        while (!validPosition) {

            x = randomPosition(radius, canvas.width);
            y = randomPosition(radius, canvas.height);

            validPosition = true;

            for (let j = 0; j < circles.length; j++) {

                let dx = circles[j].posX - x;
                let dy = circles[j].posY - y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < circles[j].radius + radius) {
                    validPosition = false;
                    break;
                }

            }

        }

        const color = randomColor();
        const speed = randomBetween(1, 5);
        const text = (i + 1).toString();

        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

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

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handleCircleCollisions();

    circles.forEach(circle => {
        circle.update(ctx, canvas.width, canvas.height);
    });

    requestAnimationFrame(animate);
}

resizeCanvas();
generateCircles(20);
animate();

window.addEventListener("resize", resizeCanvas);
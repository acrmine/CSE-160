// DrawRectangle.js
function main() {}

function angleBetween(v1, v2) {
    let dot_product = Vector3.dot(v1, v2);
    let magnitude_product = v1.magnitude() * v2.magnitude();
    let cos_theta = dot_product / magnitude_product;
    return Math.acos(cos_theta) * (180 / Math.PI); // Convert to degrees
}

function areaTriangle(v1, v2) {
    let cross_product = Vector3.cross(v1, v2);
    return 0.5 * cross_product.magnitude();
}

function drawVector(v, color) {
    coordinate_scale = 20

    // Retrieve <canvas> element <- (1)
    let canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    // Get the rendering context for 2DCG <- (2)
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + v.elements[0] * coordinate_scale, 200 - v.elements[1] * coordinate_scale);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function clearCanvas() {
    let canvas = document.getElementById('example');
    if (canvas) {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function handleDrawEvent() {
    clearCanvas();

    let v1x = document.getElementById('v1x').value;
    let v1y = document.getElementById('v1y').value;
    let v2x = document.getElementById('v2x').value;
    let v2y = document.getElementById('v2y').value;

    let v1 = new Vector3([v1x, v1y, 0.0]);
    let v2 = new Vector3([v2x, v2y, 0.0]);
    drawVector(v1, 'red');
    drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
    clearCanvas();

    let v1x = document.getElementById('v1x').value;
    let v1y = document.getElementById('v1y').value;
    let v2x = document.getElementById('v2x').value;
    let v2y = document.getElementById('v2y').value;
    let scalar = document.getElementById('scalar').value;

    let v3 = new Vector3([v1x, v1y, 0.0]);
    let v4 = new Vector3([v2x, v2y, 0.0]);

    let operation = document.getElementById('operation').value;

    drawVector(v3, 'red');
    drawVector(v4, 'blue');

    switch (operation) {
        case 'add':
            v3.add(v4);
            drawVector(v3, 'green');
            break;
        case 'subtract':
            v3.sub(v4);
            drawVector(v3, 'green');
            break;
        case 'multiply':
            v3.mul(scalar);
            v4.mul(scalar);
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
        case 'divide':
            v3.div(scalar);
            v4.div(scalar);
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
        case 'angle_between':
            let angle = angleBetween(v3, v4);
            console.log('Angle: ' + angle);
            break;
        case 'area':
            let area = areaTriangle(v3, v4);
            console.log('Area of the triangle: ' + area);
            break;
        case 'magnitude':
            console.log('Magnitude v1: ' + v3.magnitude());
            console.log('Magnitude v2: ' + v4.magnitude());
            break;
        case 'normalize':
            v3.normalize();
            v4.normalize();
            drawVector(v3, 'green');
            drawVector(v4, 'green');
            break;
    }
}
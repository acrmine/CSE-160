class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([8, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.moveSpeed = 0.8;
        this.lookSpeed = 0.2;
    }

    forward() {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(this.moveSpeed);
        this.eye.add(forward);
        this.at.add(forward);
    }

    backward() {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(this.moveSpeed);
        this.eye.sub(forward);
        this.at.sub(forward);
    }

    left() {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        forward.normalize();
        let left = this.up.cross_self(forward).normalize();
        left.mul(this.moveSpeed);
        this.eye.add(left);
        this.at.add(left);
    }

    right() {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        forward.normalize();
        let right = forward.cross_self(this.up).normalize();
        right.mul(this.moveSpeed);
        this.eye.add(right);
        this.at.add(right);
    }

    turnHorizontal(magnitude) {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        
        let rotateMatrix = new Matrix4().setRotate(magnitude * this.lookSpeed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let offsetForward = rotateMatrix.multiplyVector3(forward);
        this.at = new Vector3(this.eye.elements).add(offsetForward);
    }

    turnVertical(magnitude) {
        let forward = new Vector3(this.at.elements);
        forward.sub(this.eye);
        
        let rotateAxis = forward.cross_self(this.up).normalize();
        let rotateMatrix = new Matrix4().setRotate(magnitude * this.lookSpeed, rotateAxis.elements[0], rotateAxis.elements[1], rotateAxis.elements[2]);
        let offsetForward = rotateMatrix.multiplyVector3(forward);
        this.at = new Vector3(this.eye.elements).add(offsetForward);
    }

    setLocation(x, y, z) {
        let offset = new Vector3([x, y, z]);
        offset.sub(this.eye);
        this.eye.add(offset);
        this.at.add(offset);
    }

    move(dx, dy, dz) {
        let offset = new Vector3([dx, dy, dz]);
        this.eye.add(offset);
        this.at.add(offset);
    }
}
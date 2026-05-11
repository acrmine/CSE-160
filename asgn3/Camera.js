class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 8]);
        this.at = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.moveSpeed = 1;
        this.lookSpeed = 0.7;
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

}
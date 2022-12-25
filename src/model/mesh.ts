import { vec3, mat4 } from "gl-matrix";

export class Mesh {
    position: vec3;
    eulers: vec3;
    scale: vec3;
    model: mat4;

    constructor(position: vec3 = [0,0,0], eulers: vec3 = [0,0,0], scale: vec3 = [1,1,1]) {
        this.position = position;
        this.eulers = eulers;
        this.scale = scale;
        this.model = mat4.create();
        mat4.scale(this.model, this.model, this.scale);
        mat4.rotateX(this.model, this.model, this.eulers[0]);
        mat4.rotateY(this.model, this.model, this.eulers[1]);
        mat4.rotateZ(this.model, this.model, this.eulers[2]);
        mat4.translate(this.model, this.model, this.position);
    }

    update() {
    }

    get_model(): mat4 {
        return this.model;
    }
}
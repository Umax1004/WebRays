import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math";

export class Camera {
    position: vec3;
    eulers: vec3;
    view: mat4;
    forward: vec3;
    right: vec3;
    up: vec3;


    constructor(position: vec3 = [0,0,0], eulers: vec3 = [0,0,0]) {
        this.position = position;
        this.eulers = eulers;
        this.view = mat4.create();

        this.forward = vec3.create();
        this.right = vec3.create();
        this.up = vec3.create();
        this.view = mat4.create();
    }

    update() {
        this.forward = [
            Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
            Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
            Math.sin(Deg2Rad(this.eulers[1]))
        ]

        vec3.cross(this.right, this.forward, [0,0,1]);

        vec3.cross(this.up, this.right, this.forward);

        var target: vec3 = vec3.create();
        vec3.add(target, this.position, this.forward);
        mat4.lookAt(this.view, this.position, target, this.up);
    }

    get_view(): mat4 {
        return this.view;
    }
}
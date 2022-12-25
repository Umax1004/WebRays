import { Mesh } from "./mesh";
import { Camera } from "./camera";
import { vec3, mat4 } from "gl-matrix";

export class Scene {
    meshes: Mesh[];
    player: Camera;

    constructor() {
        this.meshes = [];
        this.meshes.push(
            new Mesh([0,0,0], [0,0,0], [15,15,15])
        );

        this.player = new Camera([-2,0,0.5]);
    }

    update() {
        this.meshes.forEach((mesh) => {mesh.update();});
        this.player.update();
    }

    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX;
        this.player.eulers[2] %= 360;

        this.player.eulers[1] = Math.min(
            89, Math.max(
                -89,
                this.player.eulers[1] + dY
            )
        );
    }

    move_player(forwards_amount: number, right_amount: number) {
        
        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.forward, forwards_amount
        );

        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.right, right_amount
        );
        mat4.translate(this.player.view, this.player.view, this.player.position);
    }

    get_player(): Camera {
        return this.player;
    }

    get_meshes(): Mesh[] {
        return this.meshes;
    }
}
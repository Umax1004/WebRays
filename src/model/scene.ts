import { Mesh } from "./mesh";
import { Camera } from "./camera";

export class Scene {
    meshes: Mesh[];
    player: Camera;

    constructor() {
        this.meshes = [];
        this.meshes.push(
            new Mesh([2,0,0], [0,0,0], [15,15,15])
        );

        this.player = new Camera([-2,0,0.5]);
    }

    update() {
        this.meshes.forEach((mesh) => {mesh.update();});
        this.player.update();
    }

    get_player(): Camera {
        return this.player;
    }

    get_meshes(): Mesh[] {
        return this.meshes;
    }
}
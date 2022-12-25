import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";

export class App {

    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;
    mouseMove: boolean = false;

    forwards_amount: number = 0;
    right_amount: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        // this.renderer.Initialize();
        this.scene = new Scene();
        // this.canvas.onclick = () => {
        //     this.canvas.requestPointerLock();
        // }
        this.canvas.addEventListener(
            "mouseup",
            (event) => {this.mouseMove = false; document.exitPointerLock();}
        )
        this.canvas.addEventListener(
            "mousedown",
            (event) => {this.mouseMove = true; this.canvas.requestPointerLock();}
        )
        this.canvas.addEventListener(
            "mousemove",
            (event) => {if(this.mouseMove) this.handle_mouse_move(event);}
        );
        window.addEventListener(
            "keypress",
            (event) => {this.handle_keyboard_move(event);}
        );
    }

    async initialize() {
        await this.renderer.Initialize();
        this.run();
    }

    run = () => {
        var running: boolean = true;

        this.scene.update();

        this.renderer.render(
            this.scene.get_player(),
            this.scene.get_meshes()
        );

        if(running) {
            requestAnimationFrame(this.run);
        }
    }

    handle_keyboard_move(event: KeyboardEvent) {

        // console.log(event.key == "s");

        if (event.key == "w") {
            this.forwards_amount = 0.02;
            this.right_amount = 0;
        }
        if (event.key == "s") {
            this.forwards_amount = -0.02;
            this.right_amount = 0;
        }
        if (event.key == "a") {
            this.forwards_amount = 0;
            this.right_amount = -0.02;
        }
        if (event.key == "d") {
            this.forwards_amount = 0;
            this.right_amount = 0.02;
        }

        this.scene.move_player(this.forwards_amount, this.right_amount);
    }

    handle_mouse_move(event: MouseEvent) {
        this.scene.spin_player(
            -event.movementX / 5, event.movementY / 5
        );
    }

}
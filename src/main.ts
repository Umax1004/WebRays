import { App } from "./control/app";

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("output");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const app : App = new App(canvas);

app.initialize();
// app.run();
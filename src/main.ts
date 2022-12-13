import { Renderer } from "./renderer";

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("output");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new Renderer(canvas);

renderer.Initialize();
import shader from "./assets/shaders/triangle.wgsl"
import {WebIO} from "@gltf-transform/core"
import mesh from "./assets/gltf_models/2.0/Avocado/glTF-Binary/Avocado.glb"

const Initialize = async() => {

    const io = new WebIO();
    console.log(mesh);
    const avocado = await io.read(mesh);
    avocado.getRoot().listMeshes().forEach((mesh) => {
        const primitive = mesh.listPrimitives()[0]; 
        console.log(primitive.listSemantics());
      });
    // Initialize important variables
    const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("output");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu.requestAdapter();
    const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
    const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
    const format : GPUTextureFormat = "bgra8unorm";
    
    context.configure({
        device: device,
        format: format,
        alphaMode: "opaque"
    });

    const pipeline : GPURenderPipeline = device.createRenderPipeline({
        vertex : {
            module : device.createShaderModule({
                code : shader
            }),
            entryPoint : "vs_main"
        },

        fragment : {
            module : device.createShaderModule({
                code : shader
            }),
            entryPoint : "fs_main",
            targets : [{
                format: format
            }]
        },

        primitive : {
            topology : "triangle-list"
        },

        layout : "auto"
    });

    const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
    const textureView : GPUTextureView = context.getCurrentTexture().createView();
    const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: {r: 1, g: 0.5, b: 0.25, a: 1.0},
            loadOp: "clear",
            storeOp: "store"
        }]
    });

    renderpass.setPipeline(pipeline);
    renderpass.draw(3, 1, 0, 0);
    renderpass.end();
    
    device.queue.submit([commandEncoder.finish()]);
}

Initialize();
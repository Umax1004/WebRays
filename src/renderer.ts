import shader from "./assets/shaders/mesh.wgsl"
import { TriangleMesh } from "./triangle_mesh"
import { WebIO } from "@gltf-transform/core"
import mesh from "./assets/gltf_models/2.0/Avocado/glTF-Binary/Avocado.glb"

export class Renderer {
    canvas: HTMLCanvasElement;

    // Device/Context objects
    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format!: GPUTextureFormat;

    // Pipeline objects
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Assets
    triangleMesh!: TriangleMesh;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    async Initialize() {

        await this.setupDevice();

        this.createAssets();
    
        await this.makePipeline();

        this.render();
    }

    async setupDevice() {
        const io = new WebIO();
        console.log(mesh);
        const avocado = await io.read(mesh);
        avocado.getRoot().listMeshes().forEach((mesh) => {
            const primitive = mesh.listPrimitives()[0];
            console.log(primitive.getIndices());
            console.log(primitive.listSemantics());
        });
        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
        this.device = <GPUDevice> await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu");
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });
    }

    createAssets() {
        this.triangleMesh = new TriangleMesh(this.device);
    }

    async makePipeline() {
        const bindGroupLayout : GPUBindGroupLayout = this.device.createBindGroupLayout({
            entries: [],
        });
    
        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: []
        });
        
        const pipelineLayout : GPUPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
    
        this.pipeline = this.device.createRenderPipeline({
            vertex : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "vs_main",
                buffers : [this.triangleMesh.bufferLayout]
            },
    
            fragment : {
                module : this.device.createShaderModule({
                    code : shader
                }),
                entryPoint : "fs_main",
                targets : [{
                    format: this.format
                }]
            },
    
            primitive : {
                topology : "triangle-list"
            },
    
            layout : pipelineLayout
        });
    }

    render = () => {
        const commandEncoder : GPUCommandEncoder = this.device.createCommandEncoder();
        const textureView : GPUTextureView = this.context.getCurrentTexture().createView();
        const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 1, g: 0.5, b: 0.25, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        renderpass.setPipeline(this.pipeline);
        renderpass.setBindGroup(0, this.bindGroup);
        renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
        renderpass.draw(3, 1, 0, 0);
        renderpass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
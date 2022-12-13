import shader from "./assets/shaders/mesh.wgsl"
import { TriangleMesh } from "./triangle_mesh"
import { mat4 } from "gl-matrix"
import { GLTFMesh } from "./gltf_mesh"
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
    uniformBuffer!: GPUBuffer;
    bindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    // Assets
    triangleMesh!: TriangleMesh;
    avocado!: GLTFMesh;

    t: number = 0.0;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    async Initialize() {

        await this.setupDevice();

        await this.createAssets();
    
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

    async createAssets() {
        this.triangleMesh = new TriangleMesh(this.device);
        this.avocado = new GLTFMesh(this.device);
        await this.avocado.loadMesh(mesh);
    }

    async makePipeline() {

        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout : GPUBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ],
        });
    
        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }
            ]
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
                buffers : this.avocado.bufferLayoutList
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

        this.t += 0.01;
        if (this.t > 2.0 * Math.PI) {
            this.t -= 2.0 * Math.PI;
        }
        
        const projection = mat4.create();
        mat4.perspective(projection, Math.PI/4, this.canvas.width/this.canvas.height, 0.1, 10);

        const view = mat4.create();
        mat4.lookAt(view, [-2, 0, 2], [0, 0, 0], [0, 0, 1]);

        const model = mat4.create();
        mat4.scale(model, model, [15,15,15]);
        mat4.rotate(model, model, this.t, [0,1,0]);


        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>model); 
        this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>view); 
        this.device.queue.writeBuffer(this.uniformBuffer, 128, <ArrayBuffer>projection);

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
        // renderpass.setVertexBuffer(0, this.triangleMesh.buffer);
        // renderpass.setVertexBuffer(1, this.triangleMesh.bufferColor);
        // renderpass.draw(3, 1, 0, 0);
        this.avocado.buffer.forEach((buffer, index) => {
            renderpass.setVertexBuffer(index, buffer);
        })
        renderpass.setIndexBuffer(this.avocado.indexBuffer[0], "uint16");
        renderpass.drawIndexed(this.avocado.indiceCount[0]);
        renderpass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.render);
    }
}
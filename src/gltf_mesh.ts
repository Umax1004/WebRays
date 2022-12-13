import { WebIO, Document } from "@gltf-transform/core"
import { NodeArray } from "typescript"

export class GLTFMesh {

    buffer: Array<GPUBuffer> = []
    indexBuffer: Array<GPUBuffer> = []
    indiceCount: Array<number> = []
    bufferLayoutList: Array<GPUVertexBufferLayout> = []
    mesh!: Document
    device: GPUDevice

    constructor(device: GPUDevice) {
        this.device = device;
    }

    async loadMesh(uri: string) {
        const io = new WebIO();
        this.mesh = await io.read(uri);
        this.mesh.getRoot().listMeshes().forEach((mesh) => {
            const primitive = mesh.listPrimitives()[0];
            const indices = primitive.getIndices();
            console.log(indices);
            const usage: GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;
            const indexdescriptor: GPUBufferDescriptor = {
                size: indices!.getByteLength(),
                usage: usage,
                mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
            };
            this.indexBuffer.push(this.device.createBuffer(indexdescriptor));
            new Uint16Array(this.indexBuffer[this.indexBuffer.length -1].getMappedRange()).set(<Uint16Array>indices!.getArray());
            this.indexBuffer[this.indexBuffer.length -1].unmap();
            this.indiceCount.push(indices!.getArray()!.length);

            const semantics : string[] = ["POSITION", "NORMAL"];
            semantics.forEach((semantic, index) => {
                const result = primitive.listSemantics().findIndex(element => element == semantic);
                if(result == -1)
                {
                    throw Error;
                }
                const attribute = primitive.getAttribute(semantic);
                const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
                const descriptor: GPUBufferDescriptor = {
                    size: attribute!.getByteLength(),
                    usage: usage,
                    mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
                };
                this.buffer.push(this.device.createBuffer(descriptor));
                new Float32Array(this.buffer[this.buffer.length -1].getMappedRange()).set(<Float32Array>attribute!.getArray());
                this.buffer[this.buffer.length -1].unmap();
                console.log(attribute, index);
                let stride : number;
                let format : GPUVertexFormat;
                switch(attribute!.getType())
                {
                    case "VEC2":
                        stride = 8;
                        format = "float32x2";
                        break;
                    case "VEC3":
                        stride = 12;
                        format = "float32x3";
                        break;
                    case "VEC4":
                        stride = 16;
                        format = "float32x4";
                        break;
                }
                this.bufferLayoutList.push(
                    {
                        arrayStride: stride!,
                        attributes: [
                            {
                                shaderLocation: index,
                                format: format!,
                                offset: 0
                            }
                        ]
                    }
                );
            });
        });
    }
}
export class TriangleMesh {

    buffer: GPUBuffer
    bufferColor: GPUBuffer
    bufferLayout: GPUVertexBufferLayout
    bufferLayoutColor: GPUVertexBufferLayout
    bufferLayoutList: Array<GPUVertexBufferLayout> = []

    constructor(device: GPUDevice) {

        // x y r g b
        // const vertices: Float32Array = new Float32Array(
        //     [
        //         0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
        //         0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
        //         0.0,  0.5, -0.5, 0.0, 0.0, 1.0
        //     ]
        // );

        const vertices: Float32Array = new Float32Array(
            [
                0.0,  0.0,  0.5, 0.0, -0.5, -0.5, 0.0,  0.5, -0.5
            ]
        );

        const colors: Float32Array = new Float32Array(
            [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
        );

        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        //VERTEX: the buffer can be used as a vertex buffer
        //COPY_DST: data can be copied to the buffer

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: usage,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };

        this.buffer = device.createBuffer(descriptor);

        //Buffer has been created, now load in the vertices
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();

        const colordescriptor: GPUBufferDescriptor = {
            size: colors.byteLength,
            usage: usage,
            mappedAtCreation: true // similar to HOST_VISIBLE, allows buffer to be written by the CPU
        };

        console.log(vertices.byteLength);
        console.log(colors.byteLength);

        this.bufferColor = device.createBuffer(colordescriptor);
        new Float32Array(this.bufferColor.getMappedRange()).set(colors);
        this.bufferColor.unmap();

        //now define the buffer layout
        this.bufferLayout = {
            arrayStride: 12,
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0
                }
            ]
        };

        this.bufferLayoutColor = {
            arrayStride: 12,
            attributes: [
                {
                    shaderLocation: 1,
                    format: "float32x3",
                    offset: 0
                }
            ]
        };

        this.bufferLayoutList.push(this.bufferLayout);
        this.bufferLayoutList.push(this.bufferLayoutColor);
    }
}
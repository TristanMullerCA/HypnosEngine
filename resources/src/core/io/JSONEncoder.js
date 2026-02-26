export class JSONEncoder {
    static encode(json) {
        let bytes = [];

        // NULL
        if (json === null) {
            bytes.push(0xc0);
        }
        // BOOLEAN
        else if (typeof json === 'boolean') {
            bytes.push(json ? 0xc3 : 0xc2);
        }
        // NUMBER
        else if (typeof json === 'number') {
            bytes.push(0xcb);
            const buf = new Float64Array([json]);
            bytes.push(...new Uint8Array(buf.buffer));
        }
        // STRING
        else if (typeof json === 'string') {
            const strBytes = new TextEncoder().encode(json);
            bytes.push(0xdb, ...this.#int32ToBytes(strBytes.length));
            bytes.push(...strBytes);
        }
        // ARRAY
        if (Array.isArray(json)) {
            bytes.push(0xdd, ...this.#int32ToBytes(json.length));
            json.forEach(item => {
                bytes.push(...this.encode(item)); // Recurse for each item
            });
        }
        // OBJECT
        else if (typeof json === 'object' && json !== null) {
            const keys = Object.keys(json);
            bytes.push(0xdf, ...this.#int32ToBytes(keys.length));
            keys.forEach(key => {
                bytes.push(...this.encode(key));
                bytes.push(...this.encode(json[key]));
            });
        }

        return new Uint8Array(bytes);
    }

    static #int32ToBytes(num) {
        return [
            (num & 0x000000ff),
            (num & 0x0000ff00) >> 8,
            (num & 0x00ff0000) >> 16,
            (num & 0xff000000) >> 24
        ];
    }

    static decode(uint8, state = { offset: 0 }) {
        // Use the specific slice of the buffer to avoid reading wrong memory
        const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);

        // Use uint8[state.offset] instead of this.bytes
        const tag = uint8[state.offset++];

        // NULL
        if (tag === 0xc0) return null;

        // BOOLEAN
        if (tag === 0xc2) return false;
        if (tag === 0xc3) return true;

        // NUMBER (Float64)
        if (tag === 0xcb) {
            const val = view.getFloat64(state.offset, true);
            state.offset += 8;
            return val;
        }

        // STRING
        if (tag === 0xdb) {
            const length = view.getUint32(state.offset, true);
            state.offset += 4;
            // Use uint8.subarray for better performance than slice
            const strBytes = uint8.subarray(state.offset, state.offset + length);
            state.offset += length;
            return new TextDecoder().decode(strBytes);
        }

        // ARRAY
        if (tag === 0xdd) {
            const length = view.getUint32(state.offset, true);
            state.offset += 4;
            const arr = [];
            for (let i = 0; i < length; i++) {
                arr.push(this.decode(uint8, state));
            }
            return arr;
        }

        // OBJECT
        if (tag === 0xdf) {
            const length = view.getUint32(state.offset, true); // Fixed 'offset' to 'state.offset'
            state.offset += 4;
            const obj = {};
            for (let i = 0; i < length; i++) {
                const key = this.decode(uint8, state);
                const value = this.decode(uint8, state);
                obj[key] = value;
            }
            return obj;
        }

        // Fallback for debugging
        console.error(`Unknown tag: 0x${tag?.toString(16)} at offset ${state.offset - 1}`);
        return undefined;
    }
}
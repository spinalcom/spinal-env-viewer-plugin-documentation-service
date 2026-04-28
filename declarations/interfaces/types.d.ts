/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from 'spinal-core-connectorjs_type';
export type FilesArgType = (SpinalFile | {
    name: string;
    buffer: Buffer;
})[] | FileList | any;

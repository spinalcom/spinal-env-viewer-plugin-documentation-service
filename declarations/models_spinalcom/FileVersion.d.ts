/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Model } from "spinal-core-connectorjs";
import { fileFormat, IFileVersionInfo } from "../interfaces";
declare class FileVersion extends Model {
    constructor(versionInfo: IFileVersionInfo);
    getAsBuffer(hubUrl?: string): Promise<Buffer>;
    getAsSpecialFormat(format: fileFormat, hubUrl?: string): Promise<Buffer | string | NodeJS.ReadableStream>;
    getAsBase64(hubUrl?: string): Promise<string>;
    getAsStream(hubUrl?: string): Promise<NodeJS.ReadableStream>;
    private _convertHashInfoToBuffer;
    static createFakeFileVersionInstance(spinalFile: any): Promise<FileVersion | undefined>;
}
export { FileVersion };
export default FileVersion;

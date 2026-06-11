/// <reference types="node" />
/// <reference types="node" />
import { Model } from "spinal-core-connectorjs";
import { IFileVersionInfo } from "../interfaces";
declare class FileVersion extends Model {
    constructor(versionInfo: IFileVersionInfo);
    getAsBuffer(hubUrl?: string): Promise<Buffer>;
    private _convertHashInfoToBuffer;
    static createFakeFileVersionInstance(spinalFile: any): Promise<FileVersion | undefined>;
}
export { FileVersion };
export default FileVersion;

import { Directory, File as SpinalFile, Path } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
export declare class FileExplorer {
    /**
     * @static
     * @param {SpinalNode} selectedNode
     * @return {*}  {Promise<Directory<SpinalFile<Path>>>}
     * @memberof FileExplorer
     */
    static getDirectory(selectedNode: SpinalNode): Promise<Directory<SpinalFile<Path>> | undefined>;
    /**
     * @static
     * @param {SpinalNode} selectedNode
     * @return {*}  {Promise<number>}
     * @memberof FileExplorer
     */
    static getNbChildren(selectedNode: SpinalNode): Promise<number>;
    static createDirectory(selectedNode: SpinalNode): Promise<Directory<SpinalFile<Path>>>;
    /**
     * @static
     * @param {File} file - HTML File
     * @return {*}  {string}
     * @memberof FileExplorer
     */
    static _getFileType(file: File): string;
    static getMimeType(fileName: string): string;
    /**
     * @static
     * @param {Directory} directory
     * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
     * @return {*}  {SpinalFile<any>[]}
     * @memberof FileExplorer
     */
    static addFileUpload(directory: Directory<SpinalFile<Path>>, files: (SpinalFile | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): SpinalFile<any>[];
    /**
     * @static
     * @param {SpinalNode} node
     * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
     * @return {*}  {Promise<SpinalFile<any>[]>}
     * @memberof FileExplorer
     */
    static uploadFiles(node: SpinalNode, files: (SpinalFile | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): Promise<SpinalFile[]>;
    static _getOrCreateFileDirectory(node: SpinalNode): Promise<Directory<SpinalFile<Path>>>;
}

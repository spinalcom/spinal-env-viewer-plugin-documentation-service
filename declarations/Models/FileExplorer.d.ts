/// <reference types="node" />
import { File as spinalFile } from 'spinal-core-connectorjs_type';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
export declare class FileExplorer {
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
     * @memberof FileExplorer
     */
    static getDirectory(selectedNode: SpinalNode<any>): Promise<spinal.Directory<spinal.File<spinal.Path>>>;
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<number>}
     * @memberof FileExplorer
     */
    static getNbChildren(selectedNode: SpinalNode<any>): Promise<number>;
    static createDirectory(selectedNode: SpinalNode<any>): Promise<spinal.Directory<any>>;
    /**
     * @static
     * @param {File} file - HTML File
     * @return {*}  {string}
     * @memberof FileExplorer
     */
    static _getFileType(file: File): string;
    /**
     * @static
     * @param {spinal.Directory<any>} directory
     * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
     * @return {*}  {spinal.File<any>[]}
     * @memberof FileExplorer
     */
    static addFileUpload(directory: spinal.Directory<any>, files: (spinalFile | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): spinal.File<any>[];
    /**
     * @static
     * @param {SpinalNode<any>} node
     * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
     * @return {*}  {Promise<spinal.File<any>[]>}
     * @memberof FileExplorer
     */
    static uploadFiles(node: SpinalNode<any>, files: (spinalFile | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): Promise<spinal.File<any>[]>;
    static _getOrCreateFileDirectory(node: SpinalNode<any>): Promise<spinal.Directory<any>>;
}

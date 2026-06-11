import { SpinalNode } from "spinal-model-graph";
import { FilesArgType } from "../interfaces";
import { SpinalDocument } from "../models_spinalcom";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
export declare class FileExplorer {
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
     * @memberof FileExplorer
     */
    static getDirectory(selectedNode: SpinalNode<any>): Promise<SpinalNode | null>;
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<number>}
     * @memberof FileExplorer
     */
    static getNbChildren(selectedNode: SpinalNode<any>): Promise<number>;
    static createDirectory(selectedNode: SpinalNode<any>): Promise<SpinalNode | null>;
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
   * @param {spinal.Directory<any>} directory
   * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
   * @return {*}  {spinal.File<any>[]}
   * @memberof FileExplorer
  
  
  */
    /**
     * @static
     * @param {SpinalNode<any>} node
     * @param {FilesArgType} files - HTML Files
     * @return {*}  {Promise<spinal.File<any>[]>}
     * @memberof FileExplorer
     */
    static uploadFiles(node: SpinalNode<any>, files: FilesArgType, chunkSize?: number): Promise<SpinalNode[]>;
    static addFileUpload(node: SpinalNode<any>, files: FilesArgType, chunkSize?: number): Promise<SpinalNode[]>;
    static getFilesLinkedToNode(node: SpinalNode<any>): Promise<(SpinalDocument | SpinalFile)[]>;
    static removeFileLinked(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<boolean>;
    static _getOrCreateFileDirectory(node: SpinalNode<any>): Promise<SpinalNode | null>;
}

"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExplorer = void 0;
const spinal_models_documentation_1 = require("spinal-models-documentation");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
const models_spinalcom_1 = require("../models_spinalcom");
class FileExplorer {
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
     * @memberof FileExplorer
     */
    static async getDirectory(selectedNode) {
        const createIfNotExist = false;
        return (0, files_1._getOrCreateRootNode)(selectedNode, createIfNotExist);
        // if (node) return node.getElement(true);
        // return null;
        // if (selectedNode != undefined) {
        //   const fileNode = await selectedNode.getChildren("hasFiles");
        //   if (fileNode.length == 0) {
        //     return undefined;
        //   } else {
        //     let directory = await fileNode[0].getElement();
        //     return directory;
        //   }
        // }
    }
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<number>}
     * @memberof FileExplorer
     */
    static async getNbChildren(selectedNode) {
        const directory = await this.getDirectory(selectedNode);
        if (directory)
            return directory.length;
        return 0;
        // const fileNode = await selectedNode.getChildren("hasFiles");
        // return fileNode.length;
    }
    static async createDirectory(selectedNode) {
        const createIfNotExist = true;
        return (0, files_1._getOrCreateRootNode)(selectedNode, createIfNotExist);
        // const node = await _getOrCreateRootNode(selectedNode, createIfNotExist);
        // if (!node) throw new Error("Failed to create or retrieve the directory node.");
        // return node.getElement(true);
    }
    /**
     * @static
     * @param {File} file - HTML File
     * @return {*}  {string}
     * @memberof FileExplorer
     */
    static _getFileType(file) {
        const imagesExtension = ["JPG", "PNG", "GIF", "WEBP", "TIFF", "PSD", "RAW", "BMP", "HEIF", "INDD", "JPEG 2000", "SVG"];
        const extension = /[^.]+$/.exec(file.name)?.[0] ?? "";
        return imagesExtension.indexOf(extension.toUpperCase()) !== -1 ? spinal_models_documentation_1.MESSAGE_TYPES.image : spinal_models_documentation_1.MESSAGE_TYPES.file;
    }
    static getMimeType(fileName) {
        const extension = /[^.]+$/.exec(fileName)?.[0] ?? "";
        const mimeTypes = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            pdf: "application/pdf",
            json: "application/json",
        };
        return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
    }
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
    static async uploadFiles(node, files, chunkSize = -1) {
        const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
        if (!isFileList && !Array.isArray(files))
            files = [files];
        return this.addFileUpload(node, files, chunkSize);
    }
    static async addFileUpload(node, files, chunkSize = -1) {
        console.log("Adding files to node:", node.info.name.get(), "Files:", files);
        const filesConverted = await (0, files_1.convertFileToSpinalDocument)(files, chunkSize);
        const directory = await FileExplorer._getOrCreateFileDirectory(node);
        // const directory = await spinalDocument.getDirectoryElement();
        if (!directory)
            throw new Error("Failed to retrieve or create the directory for the node.");
        const promises = [];
        for (const file of filesConverted) {
            promises.push(file.linkToNode(directory));
            // directory.push(file);
            // promises.push(createFileNode(file));
            // promises.push(file.linkToNode(node));
        }
        return Promise.all(promises);
        // for (const file of filesConverted) {
        //   directory.push(file);
        // }
        // return filesConverted;
    }
    static async getFilesLinkedToNode(node) {
        let rootDirNode;
        if (node instanceof models_spinalcom_1.SpinalDocument)
            node = (await node.getNode());
        if (node.getType().get() === constants_1.DIRECTORY_NODE_TYPE || node.getType().get() === constants_1.FILE_NODE_TYPE)
            rootDirNode = node;
        else
            rootDirNode = await FileExplorer.getDirectory(node);
        if (!rootDirNode)
            return [];
        return rootDirNode.getChildren([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]).then(async (children) => {
            const files = [];
            for (const child of children) {
                const element = await (0, files_1.getFileModelFromNode)(child);
                if (element)
                    files.push(element);
            }
            return files;
        });
    }
    static async _getOrCreateFileDirectory(node) {
        let directory = await FileExplorer.getDirectory(node);
        if (!directory) {
            directory = await FileExplorer.createDirectory(node);
        }
        return directory;
    }
}
exports.FileExplorer = FileExplorer;
//# sourceMappingURL=FileExplorer.js.map
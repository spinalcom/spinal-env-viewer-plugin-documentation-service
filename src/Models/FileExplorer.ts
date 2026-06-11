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

import { SPINAL_RELATION_PTR_LST_TYPE, SpinalNode } from "spinal-model-graph";
import { MESSAGE_TYPES } from "spinal-models-documentation";
import { _getOrCreateRootNode, convertFileToSpinalDocument, createFileNode, getFileModelFromNode } from "../utils/files";
import { FilesArgType } from "../interfaces";
import { DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "./constants";
import { SpinalDocument } from "../models_spinalcom";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalDocumentary } from "./Documentary";

export class FileExplorer {
	/**
	 * @static
	 * @param {SpinalNode<any>} selectedNode
	 * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
	 * @memberof FileExplorer
	 */
	public static async getDirectory(selectedNode: SpinalNode<any>): Promise<SpinalNode | null> {
		const createIfNotExist = false;
		return _getOrCreateRootNode(selectedNode, createIfNotExist);
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
	public static async getNbChildren(selectedNode: SpinalNode<any>): Promise<number> {
		const directory = await this.getDirectory(selectedNode);
		if (directory) return directory.length;

		return 0;
		// const fileNode = await selectedNode.getChildren("hasFiles");
		// return fileNode.length;
	}

	public static async createDirectory(selectedNode: SpinalNode<any>): Promise<SpinalNode | null> {
		const createIfNotExist = true;
		return _getOrCreateRootNode(selectedNode, createIfNotExist);
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
	public static _getFileType(file: File): string {
		const imagesExtension = ["JPG", "PNG", "GIF", "WEBP", "TIFF", "PSD", "RAW", "BMP", "HEIF", "INDD", "JPEG 2000", "SVG"];
		const extension = /[^.]+$/.exec(file.name)?.[0] ?? "";

		return imagesExtension.indexOf(extension.toUpperCase()) !== -1 ? MESSAGE_TYPES.image : MESSAGE_TYPES.file;
	}

	static getMimeType(fileName: string): string {
		const extension = /[^.]+$/.exec(fileName)?.[0] ?? "";
		const mimeTypes = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			bmp: "image/bmp",
			pdf: "application/pdf",
			json: "application/json",
		};

		return mimeTypes[extension.toLowerCase() as keyof typeof mimeTypes] || "application/octet-stream";
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
	public static async uploadFiles(node: SpinalNode<any>, files: FilesArgType, chunkSize: number = -1): Promise<SpinalNode[]> {
		const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
		if (!isFileList && !Array.isArray(files)) files = [files];

		return this.addFileUpload(node, files, chunkSize);
	}

	public static async addFileUpload(node: SpinalNode<any>, files: FilesArgType, chunkSize: number = -1): Promise<SpinalNode[]> {
		const filesConverted = await convertFileToSpinalDocument(files, chunkSize);
		const directory: SpinalNode | null = await FileExplorer._getOrCreateFileDirectory(node);
		// const directory = await spinalDocument.getDirectoryElement();

		if (!directory) throw new Error("Failed to retrieve or create the directory for the node.");

		const promises: Promise<SpinalNode | null>[] = [];

		for (const file of filesConverted) {
			if (file instanceof SpinalDocument) {
				promises.push(file.linkToNode(directory));
			} else if (file instanceof SpinalFile) {
				promises.push(SpinalDocumentary.pushFileToDirectory(directory, file));
			}

			// directory.push(file);
			// promises.push(createFileNode(file));
			// promises.push(file.linkToNode(node));
		}

		return Promise.all(promises).then((results) => {
			return results.filter((result): result is SpinalNode => result !== null);
		});
	}

	public static async getFilesLinkedToNode(node: SpinalNode<any>): Promise<(SpinalDocument | SpinalFile)[]> {
		let rootDirNode;
		if (node instanceof SpinalDocument) node = (await node.getNode()) as SpinalNode;
		if (node.getType().get() === DIRECTORY_NODE_TYPE || node.getType().get() === FILE_NODE_TYPE) rootDirNode = node;
		else rootDirNode = await FileExplorer.getDirectory(node);

		if (!rootDirNode) return [];

		return rootDirNode.getChildren([TO_FILE_RELATION, TO_FOLDER_RELATION]).then(async (children) => {
			const files: (SpinalDocument | SpinalFile)[] = [];
			for (const child of children) {
				const element = await getFileModelFromNode(child);
				if (element) files.push(element);
			}
			return files;
		});
	}

	public static async removeFileLinked(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<boolean> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return false;

		let fileModel: SpinalDocument | SpinalFile | undefined = undefined;

		if (fileNode instanceof SpinalDocument || fileNode instanceof SpinalFile) {
			fileModel = fileNode;
			fileNode = await createFileNode(fileNode instanceof SpinalDocument ? fileNode : (fileNode as SpinalFile));
		}

		const relationName = fileNode.getType().get() === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
		return rootDirNode
			.removeChild(fileNode, relationName, SPINAL_RELATION_PTR_LST_TYPE)
			.then(async () => {
				fileModel = fileModel || (await getFileModelFromNode(fileNode as SpinalNode));

				return SpinalDocumentary.removeFileFromDirectory(rootDirNode, fileModel as any);
			})
			.catch(() => false);
	}

	public static async _getOrCreateFileDirectory(node: SpinalNode<any>): Promise<SpinalNode | null> {
		let directory = await FileExplorer.getDirectory(node);

		if (!directory) {
			directory = await FileExplorer.createDirectory(node);
		}

		return directory;
	}
}

import { File as SpinalFile, Lst, Directory } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { _getFileAsBuffer, _getFileAttributes, _getFileChildren, _getOrCreateRootNode, addSpinalDocumentAsNodeChild, convertFileInTreeToSpecialFormat, convertFileToSpecialFormat, convertFileToSpinalDocument, convertTreeToFileBuffers, createorGetFileNode, getFileModelFromNode, removeFileNodeFromParent } from "../utils/files";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, DOCUMENTARY_CONTEXT_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "./constants";
import { fileFormat, FilesArgType, IFileInfo } from "../interfaces";
import { FileVersion, SpinalDocument } from "../models_spinalcom";
import { FileExplorer } from "./FileExplorer";

/**
 * Service class that manages documentation files and directories in a Spinal graph context.
 */
class SpinalDocumentary {
	constructor() {}

	////////////////// Inside context functions ///////////////////////

	/**
	 * Creates and adds a documentary context to a graph.
	 * @param {SpinalGraph} graph Graph that will contain the context.
	 * @param {string} name Name of the context to create.
	 * @returns {Promise<SpinalContext>} The created context.
	 */
	public async createDocumentaryContext(graph: SpinalGraph, name: string): Promise<SpinalContext> {
		const context = new SpinalContext(name, DOCUMENTARY_CONTEXT_TYPE);
		return graph.addContext(context);
	}

	/**
	 * Converts input files to Spinal documents and links them under a parent node in context.
	 * @param {SpinalNode} parentNode Parent node receiving file links.
	 * @param {FilesArgType} files File input(s) to convert.
	 * @param {SpinalContext} contextNode Context where links are created.
	 * @param {number} [chunkSize=-1] Optional chunk size used by file conversion.
	 * @returns {Promise<SpinalNode[]>} Linked file nodes.
	 */
	public async addFileToNodeInContext(parentNode: SpinalNode | SpinalDocument, files: FilesArgType, contextNode: SpinalContext, chunkSize: number = -1): Promise<SpinalNode[]> {
		if (parentNode instanceof SpinalDocument) parentNode = (await parentNode.getNode()) as SpinalNode;
		const filesConverted = await convertFileToSpinalDocument(files, chunkSize);
		const promises: Promise<SpinalNode>[] = [];

		for (const file of filesConverted) {
			promises.push(file.linkToNode(parentNode, contextNode));
		}

		return Promise.all(promises);
	}

	/**
	 * Adds an existing file node/model to a parent node in context.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File reference to add.
	 * @param {SpinalNode} parentNode Parent node receiving the file.
	 * @param {SpinalContext} contextNode Context where the link is created.
	 * @returns {Promise<SpinalNode | null>} The created file node link, or null.
	 */
	public async addExistingFileToContext(fileNode: SpinalNode | SpinalDocument | SpinalFile, parentNode: SpinalNode, contextNode: SpinalContext): Promise<SpinalNode | null> {
		const file = await createorGetFileNode(fileNode);
		if (!file) return null;
		return this.addFileToNodeInContext(parentNode, file, contextNode).then((result) => (result.length > 0 ? result[0] : null));
	}

	/**
	 * Removes a file from a context and optionally removes descendants.
	 * @param {SpinalNode | SpinalDocument} fileNode File node/model to remove.
	 * @param {SpinalContext} contextNode Context from which the file is removed.
	 * @param {{ unlinkRefs?: boolean; removeChildren?: boolean }} [options] Removal options.
	 * @returns {Promise<boolean>} True when completed.
	 */
	public async removeFileFromContext(fileNode: SpinalNode | SpinalDocument, contextNode: SpinalContext, options?: { unlinkRefs?: boolean; removeChildren?: boolean }): Promise<boolean> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode || !(fileNode instanceof SpinalDocument)) throw new Error("File model not found for the given node.");

		const unlinkRefs = options?.unlinkRefs ?? true;
		await fileNode.removeFromContext(contextNode, unlinkRefs);

		if (options?.removeChildren && fileNode.isDirectory()) {
			const node = await fileNode.getNode();
			if (!node) throw new Error("Directory node not found.");
			const children = await node.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
			const removeChildrenPromises = children.map((child: SpinalNode) => this.removeFileFromContext(child, contextNode, options));
			await Promise.all(removeChildrenPromises);
		}

		// if (unlinkRefs) await fileNode.removeAllLinks();

		return true;

		// if (fileNode instanceof SpinalDocument) fileNode = (await fileNode.getNode()) as SpinalNode;
		// if (fileNode.getType().get() !== DIRECTORY_NODE_TYPE) return removeFileNode(fileNode, contextNode, unlinkRefs);
		// const files = await fileNode.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
		// const promises: Promise<boolean | boolean[]>[] = [];
		// for (const file of files) {
		// 	promises.push(this.removeFileFromContext(file, contextNode, unlinkRefs));
		// }
		// return Promise.all(promises).then((result) => {
		// 	return true;
		// });
	}

	/**
	 * Creates a directory and links it under a parent node in context.
	 * @param {SpinalNode} parentNode Parent node receiving the directory.
	 * @param {string} name Directory name.
	 * @param {SpinalContext} [contextNode] Optional context for contextual linking.
	 * @param {string} [icon="folder"] Icon metadata.
	 * @returns {Promise<SpinalNode>} Linked directory node.
	 */
	public addDirectoryToNodeInContext(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon: string = "folder"): Promise<SpinalNode> {
		const file = new SpinalDocument(name, new Lst(), { model_type: DIRECTORY_MODEL_TYPE, icon });
		return file.linkToNode(parentNode, contextNode);
	}

	/**
	 * Moves a document from a source parent to a target parent in context.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} documentToMove File to move.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} sourceNode Current parent node.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} targetNode Destination parent node.
	 * @param {SpinalContext} contextNode Context where the move occurs.
	 * @returns {Promise<boolean>} True on success, false otherwise.
	 */
	public async moveDocumentInContext(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext): Promise<boolean> {
		documentToMove = await createorGetFileNode(documentToMove);
		sourceNode = await createorGetFileNode(sourceNode);
		targetNode = await createorGetFileNode(targetNode);

		if (!documentToMove.belongsToContext(contextNode) && documentToMove._server_id !== contextNode._server_id) throw new Error("Document to move does not belong to the specified context.");
		if (!sourceNode.belongsToContext(contextNode) && sourceNode._server_id !== contextNode._server_id) throw new Error("Source node does not belong to the specified context.");
		if (!targetNode.belongsToContext(contextNode) && targetNode._server_id !== contextNode._server_id) throw new Error("Target node does not belong to the specified context.");

		await removeFileNodeFromParent(sourceNode, documentToMove);

		return this.addFileToNodeInContext(targetNode, documentToMove, contextNode)
			.then((result) => !!result)
			.catch(() => false);
	}

	// public async copyFileInContext(fileNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext, useSymbolicLink: boolean = false): Promise<SpinalNode | null> {
	// 	if (!useSymbolicLink) {
	// 		const
	// 	}
	// }

	/////////////////// Versioning functions ///////////////////////

	/**
	 * Gets the versions of a file.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
	 * @returns {Promise<FileVersion[]>} Version history for the file.
	 */
	public async getFileVersions(fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<FileVersion[]> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode) throw new Error("File model not found for the given node.");

		if (fileNode instanceof SpinalDocument) return fileNode.getVersionHistory();

		if (fileNode instanceof SpinalFile) {
			const fakeFileVersion = await FileVersion.createFakeFileVersionInstance(fileNode);
			if (fakeFileVersion) return [fakeFileVersion];
		}

		// if (fileNode instanceof SpinalFile) {
		// const fakeFileVersion = FileVersion.createFakeFileVersionInstance(fileNode);
		// return [fakeFileVersion];
		// }

		throw new Error("Unsupported file model type.");
	}

	/**
	 * Gets one version by its name.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
	 * @param {string} versionName Version name to retrieve.
	 * @returns {Promise<FileVersion | null>} Matching version or null.
	 */
	public async getFileVersionByName(fileNode: SpinalNode | SpinalDocument | SpinalFile, versionName: string): Promise<FileVersion | null> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode) throw new Error("File model not found for the given node.");

		if (fileNode instanceof SpinalDocument) return fileNode.getVersionByName(versionName);
		return null;
	}

	/**
	 * Creates a new version from a buffer or file input.
	 * @param {SpinalNode | SpinalDocument} fileNode File node/model to update.
	 * @param {Buffer | FilesArgType} buffer New content payload.
	 * @param {string} [versionName] Optional version name.
	 * @param {number} [chunkSize] Optional chunk size used by persistence.
	 * @returns {Promise<FileVersion>} Created file version.
	 */
	public async updateFileVersion(fileNode: SpinalNode | SpinalDocument, buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<FileVersion> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode || !(fileNode instanceof SpinalDocument)) throw new Error("File model not found for the given node.");

		return fileNode.updateVersion(buffer, versionName, chunkSize);
	}

	/**
	 * Removes a version from a file history.
	 * @param {SpinalNode | SpinalDocument} fileNode File node/model.
	 * @param {string} versionName Version name to remove.
	 * @returns {Promise<boolean>} True if version is removed.
	 */
	public async removeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<boolean> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode || !(fileNode instanceof SpinalDocument)) throw new Error("File model not found for the given node.");

		return fileNode.removeVersion(versionName);
	}

	/**
	 * Sets a version as the current version.
	 * @param {SpinalNode | SpinalDocument} fileNode File node/model.
	 * @param {string} versionName Version name to set as current.
	 * @returns {Promise<FileVersion>} The new current version.
	 */
	public async downgradeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<FileVersion> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode || !(fileNode instanceof SpinalDocument)) throw new Error("File model not found for the given node.");

		return fileNode.setAsCurrentVersion(versionName);
	}

	//////////////////////////////////

	/**
	 * Lists all paths in a file tree from a starting node.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
	 * @returns {Promise<IFileInfo[]>} File tree entries with path data.
	 */
	public async getAllPathsInTree(startNode: SpinalNode | SpinalDocument | SpinalFile): Promise<IFileInfo[]> {
		return convertFileInTreeToSpecialFormat(startNode, undefined, "", false);
	}

	/**
	 * Exports all files in a tree as buffers.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<IFileInfo[]>} Converted file data.
	 */
	public async getFilesInTreeAsBuffer(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl: string = ""): Promise<IFileInfo[]> {
		return convertTreeToFileBuffers(startNode, hubUrl);
	}

	/**
	 * Exports all files in a tree to a specific format.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
	 * @param {fileFormat} format Output format.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<IFileInfo[]>} Converted file data.
	 */
	public async getFilesInTreeToSpecificFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl: string = ""): Promise<IFileInfo[]> {
		return convertFileInTreeToSpecialFormat(startNode, format, hubUrl, true);
	}

	/**
	 * Converts a file to a `{ name, buffer }` structure.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<{ name: string; buffer: Buffer }>} Converted buffer payload.
	 */
	public async convertFileToBuffer(file: SpinalNode | SpinalDocument | SpinalFile, hubUrl: string = ""): Promise<{ name: string; buffer: Buffer }> {
		return convertFileToSpecialFormat(file, "buffer", hubUrl).then((result) => {
			return { name: result.name, buffer: result.data as Buffer };
		});
	}

	/**
	 * Converts a file to the requested special format.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
	 * @param {fileFormat} format Output format.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<IFileInfo>} Converted file descriptor.
	 */
	public async convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl: string = ""): Promise<IFileInfo> {
		return convertFileToSpecialFormat(file, format, hubUrl);
	}

	/**
	 * Links a file to a business node through file explorer relation.
	 * @param {SpinalNode} node Business node.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
	 * @returns {Promise<SpinalNode | null>} First linked file node or null.
	 */
	public async linkFileToNode(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode | null> {
		let fileModel: SpinalDocument | SpinalFile | undefined;

		if (fileNode instanceof SpinalNode) fileModel = await getFileModelFromNode(fileNode);
		else fileModel = fileNode;

		const filesUploaded = await FileExplorer.addFileUpload(node, fileModel);
		return filesUploaded[0] || null;
	}

	///////////// file Linked to node functions
	/**
	 * Gets files linked to a business node.
	 * @param {SpinalNode} node Business node.
	 * @returns {ReturnType<typeof FileExplorer.getFilesLinkedToNode>} Linked files.
	 */
	public async getFileLinkedToNode(node: SpinalNode): ReturnType<typeof FileExplorer.getFilesLinkedToNode> {
		return FileExplorer.getFilesLinkedToNode(node);
	}

	/**
	 * Gets linked files as buffers.
	 * @param {SpinalNode} node Business node.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<{ name: string; path: string; buffer: Buffer }[]>} Linked files as buffers.
	 */
	public async getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl: string = ""): Promise<{ name: string; path: string; buffer: Buffer }[]> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return [];

		return convertTreeToFileBuffers(rootDirNode, hubUrl);
	}

	/**
	 * Gets linked files converted to a specific format.
	 * @param {SpinalNode} node Business node.
	 * @param {fileFormat} format Output format.
	 * @param {string} [hubUrl=""] Optional hub URL.
	 * @returns {Promise<{ name: string; data: Buffer | string | NodeJS.ReadableStream }[]>} Converted linked files.
	 */
	public async getFileLinkedToNodeToSpecificFormat(node: SpinalNode, format: fileFormat, hubUrl: string = ""): Promise<{ name: string; data: Buffer | string | NodeJS.ReadableStream }[]> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return [];

		return convertFileInTreeToSpecialFormat(rootDirNode, format, hubUrl, true);
	}

	/**
	 * Gets parent nodes of a file.
	 * @param {SpinalNode | SpinalDocument | SpinalFile} node File node/model.
	 * @returns {Promise<SpinalNode[]>} Parent nodes.
	 */
	public async getFileParents(node: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode[]> {
		return FileExplorer.getFileParents(node);
	}
	///////////// end of file Linked to node functions

	/**
	 * Unlinks a file from a business node.
	 * @param {SpinalNode} node Business node.
	 * @param {SpinalNode} fileNode File node to unlink.
	 * @returns {ReturnType<typeof FileExplorer.removeFileLinked>} Result of unlink operation.
	 */
	public async unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode) {
		return FileExplorer.removeFileLinked(node, fileNode);
	}

	private async _createNodeInContext(file: SpinalDocument | SpinalFile, parent: SpinalNode, relationName: string, contextNode: SpinalContext<any>) {
		// let node: SpinalNode | null = null;

		const node = await createorGetFileNode(file);

		if (!node) return null;

		await parent.addChildInContext(node, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
		return node as SpinalNode;
	}

	/**
	 * Pushes a file into a directory list and adds corresponding graph relation.
	 * @param {SpinalNode} directoryNode Directory node.
	 * @param {SpinalDocument | SpinalFile} file File model to push.
	 * @returns {Promise<SpinalNode | null>} Created child node relation or null.
	 */
	public static async pushFileToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<SpinalNode | null> {
		const fileNode = await createorGetFileNode(file);
		const directoryElement = await getFileModelFromNode(directoryNode);
		const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
		if (!list) throw new Error("Directory list not found or failed to load.");

		if (list instanceof Lst || list instanceof Directory) {
			const relationName = fileNode.getType().get() == DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
			list.push(file);
			return directoryNode.addChild(fileNode, relationName, SPINAL_RELATION_PTR_LST_TYPE);
		}

		return null;
	}

	/**
	 * Removes a file from a directory list.
	 * @param {SpinalNode} directoryNode Directory node.
	 * @param {SpinalDocument | SpinalFile | SpinalNode} file File node/model to remove.
	 * @returns {Promise<boolean>} True if removed.
	 */
	public static async removeFileFromDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile | SpinalNode): Promise<boolean> {
		const directoryElement = await getFileModelFromNode(directoryNode);
		const fileModel = await getFileModelFromNode(file);
		if (!fileModel) return false;

		const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
		if (!list) return false;

		if (list instanceof Lst || list instanceof Directory) {
			for (let f of list) {
				if (f._server_id == fileModel._server_id) {
					list.remove(f);
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Imports a SpinalDrive hierarchy into context using breadth-first traversal.
	 * @param {SpinalContext} contextNode Destination context.
	 * @param {SpinalNode} parentNode Parent node used as import root.
	 * @param {SpinalDocument} startFile First file/directory to import.
	 * @returns {Promise<SpinalNode[]>} All created nodes.
	 */
	public async importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalDocument): Promise<SpinalNode[]> {
		const queue: { file: SpinalDocument; parent: SpinalNode }[] = [{ file: startFile, parent: parentNode }];
		const createdNodes: SpinalNode[] = [];

		while (queue.length > 0) {
			const itemToProcess = queue.shift();
			if (!itemToProcess) continue;

			const { file, parent } = itemToProcess;
			const { name, nodeType, relationName } = await _getFileAttributes(file);

			const node = await this._createNodeInContext(file, parent, relationName, contextNode);
			if (!node) continue;

			// Only push to createdNodes if it's a file, directories will be processed for their children
			if (nodeType == DIRECTORY_NODE_TYPE) {
				const children = await _getFileChildren(file, node);
				queue.push(...children);
			}
			createdNodes.push(node);
		}

		return createdNodes;
	}

	// public async moveDocument(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile): Promise<boolean> {
	// 	documentToMove = await createorGetFileNode(documentToMove);
	// 	sourceNode = await createorGetFileNode(sourceNode);
	// 	targetNode = await createorGetFileNode(targetNode);

	// 	await this.unlinkFileFromNode(sourceNode, documentToMove);
	// 	return this.linkFileToNode(targetNode, documentToMove)
	// 		.then((result) => !!result)
	// 		.catch(() => false);
	// }
}

export { SpinalDocumentary };
export default SpinalDocumentary;

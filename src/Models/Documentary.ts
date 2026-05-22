import { File, Directory as SpinalDirectory, Ptr } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from "spinal-model-graph";
import { _getFileAsBuffer, _getFileAttributes, _getFileChildren, _getOrCreateRootNode, addChildrenToNode, convertFileToSpinalFile, convertTreeToFileBuffers, removeFileNode } from "../utils/files";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "./constants";
import { FilesArgType } from "../interfaces";
import { SpinalFile } from "../models_spinalcom";

class SpinalDocumentary {
	constructor() {}

	public addFileToNode(parentNode: SpinalNode, files: FilesArgType, contextNode?: SpinalContext, chunkSize: number = -1): Promise<SpinalNode[]> {
		const filesConverted = convertFileToSpinalFile(files, chunkSize);
		const promises: Promise<SpinalNode>[] = [];

		for (const file of filesConverted) {
			promises.push(file.linkToNode(parentNode, contextNode));
		}

		return Promise.all(promises);
	}

	public async removeFile(fileNode: SpinalNode | SpinalFile): Promise<boolean> {
		if (fileNode instanceof SpinalFile) fileNode = (await fileNode.getNode()) as SpinalNode;

		if (fileNode.getType().get() !== DIRECTORY_NODE_TYPE) return removeFileNode(fileNode);

		const files = await fileNode.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
		const promises: Promise<boolean | boolean[]>[] = [];

		for (const file of files) {
			promises.push(this.removeFile(file));
		}

		return Promise.all(promises).then((result) => {
			return true;
		});
	}

	public createDirectoryNode(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon: string = "folder"): Promise<SpinalNode> {
		const file = new SpinalFile(name, new SpinalDirectory(), { model_type: DIRECTORY_MODEL_TYPE, icon });
		return file.linkToNode(parentNode, contextNode);
	}

	public async importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]> {
		const queue: { file: SpinalFile; parent: SpinalNode }[] = [{ file: startFile, parent: parentNode }];
		const createdNodes: SpinalNode[] = [];

		while (queue.length > 0) {
			const itemToProcess = queue.shift();
			if (!itemToProcess) continue;

			const { file, parent } = itemToProcess;
			const { name, nodeType, relationName } = await _getFileAttributes(file);

			const node = await this._createNodeInContext(file, parent, relationName, contextNode);

			// Only push to createdNodes if it's a file, directories will be processed for their children
			if (nodeType === DIRECTORY_NODE_TYPE) {
				const children = await _getFileChildren(file, node);
				queue.push(...children);
			}
			createdNodes.push(node);
		}

		return createdNodes;
	}

	public async getFilesInTreeAsBuffer(startNode: SpinalNode, hubUrl: string = ""): Promise<{ name: string; path: string; buffer: Buffer }[]> {
		return convertTreeToFileBuffers(startNode, hubUrl);
	}

	public async convertFileToBuffer(file: SpinalNode | SpinalFile, hubUrl: string = ""): Promise<{ name: string; buffer: Buffer }> {
		// if (file instanceof SpinalNode) file = (await file.getElement(true)) as SpinalFile;
		const buffer = await _getFileAsBuffer(file, hubUrl);
		const name = file.name.get();

		return { name, buffer };
	}

	public async linkFileToNode(node: SpinalNode, fileNode: SpinalNode) {
		const rootDirNode = await _getOrCreateRootNode(node);
		if (!rootDirNode) throw new Error("Unable to create or get root directory node");

		const relationName = fileNode.getType().get() === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
		return addChildrenToNode(rootDirNode, fileNode, relationName, undefined);
	}

	public async getFileLinkedToNode(node: SpinalNode): Promise<SpinalNode[]> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return [];

		const children = await rootDirNode.getChildren([TO_FILE_RELATION, TO_FOLDER_RELATION]);
		return children;
	}

	public async getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl: string = ""): Promise<{ name: string; path: string; buffer: Buffer }[]> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return [];

		return convertTreeToFileBuffers(rootDirNode, hubUrl);
	}

	public async unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode) {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return;

		const relationName = fileNode.getType().get() === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
		await rootDirNode.removeChild(fileNode, relationName, SPINAL_RELATION_PTR_LST_TYPE);
	}

	private async _createNodeInContext(file: SpinalFile, parent: SpinalNode, relationName: string, contextNode: SpinalContext<any>) {
		const node = await file.getNode();
		await parent.addChildInContext(node, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
		return node as SpinalNode;
	}
}

export { SpinalDocumentary };
export default SpinalDocumentary;

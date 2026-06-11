import { File as SpinalFile, Lst, Directory } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from "spinal-model-graph";
import { _getFileAsBuffer, _getFileAttributes, _getFileChildren, _getOrCreateRootNode, addSpinalDocumentAsNodeChild, convertFileToSpinalDocument, convertTreeToFileBuffers, createFileNode, getFileModelFromNode, removeFileNode } from "../utils/files";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "./constants";
import { FilesArgType } from "../interfaces";
import { FileVersion, SpinalDocument } from "../models_spinalcom";
import { FileExplorer } from "./FileExplorer";

class SpinalDocumentary {
	constructor() {}

	public async addFileToNodeInContext(parentNode: SpinalNode, files: FilesArgType, contextNode: SpinalContext, chunkSize: number = -1): Promise<SpinalNode[]> {
		const filesConverted = await convertFileToSpinalDocument(files, chunkSize);
		const promises: Promise<SpinalNode>[] = [];

		for (const file of filesConverted) {
			promises.push(file.linkToNode(parentNode, contextNode));
		}

		return Promise.all(promises);
	}

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

	public async updateFileVersion(fileNode: SpinalNode | SpinalDocument, buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<void> {
		if (fileNode instanceof SpinalNode) fileNode = (await getFileModelFromNode(fileNode)) as SpinalDocument;
		if (!fileNode || !(fileNode instanceof SpinalDocument)) throw new Error("File model not found for the given node.");

		return fileNode.updateVersion(buffer, versionName, chunkSize);
	}

	public async removeFileFromContext(fileNode: SpinalNode | SpinalDocument): Promise<boolean> {
		if (fileNode instanceof SpinalDocument) fileNode = (await fileNode.getNode()) as SpinalNode;

		if (fileNode.getType().get() !== DIRECTORY_NODE_TYPE) return removeFileNode(fileNode);

		const files = await fileNode.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
		const promises: Promise<boolean | boolean[]>[] = [];

		for (const file of files) {
			promises.push(this.removeFileFromContext(file));
		}

		return Promise.all(promises).then((result) => {
			return true;
		});
	}

	public addDirectoryToNodeInContext(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon: string = "folder"): Promise<SpinalNode> {
		const file = new SpinalDocument(name, new Lst(), { model_type: DIRECTORY_MODEL_TYPE, icon });
		return file.linkToNode(parentNode, contextNode);
	}

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
			if (nodeType === DIRECTORY_NODE_TYPE) {
				const children = await _getFileChildren(file, node);
				queue.push(...children);
			}
			createdNodes.push(node);
		}

		return createdNodes;
	}

	//////////////////////////////////

	public async getFilesInTreeAsBuffer(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl: string = ""): Promise<{ name: string; path: string; buffer: Buffer }[]> {
		return convertTreeToFileBuffers(startNode, hubUrl);
	}

	public async convertFileToBuffer(file: SpinalNode | SpinalDocument | SpinalFile, hubUrl: string = ""): Promise<{ name: string; buffer: Buffer }> {
		// if (file instanceof SpinalNode) file = (await file.getElement(true)) as SpinalDocument;
		const buffer = await _getFileAsBuffer(file, hubUrl);
		const name = file.name.get();

		return { name, buffer };
	}

	public async linkFileToNode(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode | null> {
		let fileModel: SpinalDocument | SpinalFile | undefined;

		if (fileNode instanceof SpinalNode) fileModel = await getFileModelFromNode(fileNode);
		else fileModel = fileNode;

		const filesUploaded = await FileExplorer.addFileUpload(node, fileModel);
		return filesUploaded[0] || null;
	}

	public async getFileLinkedToNode(node: SpinalNode): ReturnType<typeof FileExplorer.getFilesLinkedToNode> {
		return FileExplorer.getFilesLinkedToNode(node);
	}

	public async getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl: string = ""): Promise<{ name: string; path: string; buffer: Buffer }[]> {
		const rootDirNode = await _getOrCreateRootNode(node, false);
		if (!rootDirNode) return [];

		return convertTreeToFileBuffers(rootDirNode, hubUrl);
	}

	//TODO: correct this function
	public async unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode) {
		return FileExplorer.removeFileLinked(node, fileNode);
	}

	private async _createNodeInContext(file: SpinalDocument | SpinalFile, parent: SpinalNode, relationName: string, contextNode: SpinalContext<any>) {
		// let node: SpinalNode | null = null;

		const node = await createFileNode(file);

		if (!node) return null;

		await parent.addChildInContext(node, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
		return node as SpinalNode;
	}

	public static async pushFileToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<SpinalNode | null> {
		const fileNode = await createFileNode(file);
		const directoryElement = await getFileModelFromNode(directoryNode);
		const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
		if (!list) throw new Error("Directory list not found or failed to load.");

		if (list instanceof Lst || list instanceof Directory) {
			const relationName = fileNode.getType().get() === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
			list.push(file);
			return directoryNode.addChild(fileNode, relationName, SPINAL_RELATION_PTR_LST_TYPE);
		}

		return null;
	}

	public static async removeFileFromDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<boolean> {
		const directoryElement = await getFileModelFromNode(directoryNode);
		const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
		if (!list) return false;

		if (list instanceof Lst || list instanceof Directory) {
			for (let f of list) {
				if (f._server_id === file._server_id) {
					list.remove(f);
					return true;
				}
			}
		}

		return false;
	}
}

export { SpinalDocumentary };
export default SpinalDocumentary;

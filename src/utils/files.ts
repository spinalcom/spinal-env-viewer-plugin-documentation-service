import { Path as SpinalPath, Lst, File as SpinalFile, Ptr, Directory } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { FileExplorer } from "../Models/FileExplorer";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_MODEL_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION, TO_ROOT_DIRECTORY_RELATION } from "../Models/constants";
import { FilesArgType } from "../interfaces";
import axiosRetry from "axios-retry";
import axios from "axios";
import { SpinalDocument } from "../models_spinalcom/SpinalDocument";
import VersionUtils from "./versionUtils";
import { FileVersion } from "../models_spinalcom/FileVersion";

export async function convertFileToSpinalDocument(files: FilesArgType, chunkSize: number = -1): Promise<(SpinalDocument | SpinalFile)[]> {
	const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
	if (!isFileList && !Array.isArray(files)) files = [files];

	const res: (SpinalDocument | SpinalFile)[] = [];

	for (let i = 0; i < files.length; i++) {
		const element = files[i];

		if (element instanceof SpinalFile || element instanceof SpinalDocument) {
			res.push(element);
			await createFileNode(element);
			continue;
		}
		// let filePath: SpinalPath | undefined;

		// if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
		// else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));

		const hashes = await VersionUtils.getInstance().convertFileToHashes(element.buffer || element, [], chunkSize);
		const fileVersion = new FileVersion({ version: 1, hashes });
		let file = new SpinalDocument(element.name, fileVersion, { model_type: FILE_MODEL_TYPE });

		res.push(file);
	}

	return res;
}

export async function convertFileToBuffer(file: any): Promise<Buffer> {
	if (Buffer.isBuffer(file)) return file;
	let arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();

	return Buffer.from(arrayBuffer);
}

export function addSpinalDocumentAsNodeChild(parentNode: SpinalNode, spinalDocumentNode: SpinalNode, relationName: string, contextNode?: SpinalContext): Promise<SpinalNode> {
	let prom;
	if (contextNode) prom = parentNode.addChildInContext(spinalDocumentNode, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
	else prom = parentNode.addChild(spinalDocumentNode, relationName, SPINAL_RELATION_PTR_LST_TYPE);

	return prom.then(async (result) => {
		if (parentNode.getType().get() === DIRECTORY_NODE_TYPE) {
			const childSpinalDocument = await getFileModelFromNode(spinalDocumentNode);
			if (!childSpinalDocument) return result;

			await _addFileNodeToDirectory(parentNode, childSpinalDocument as SpinalDocument);
		}

		return result;
	});
}

export async function getFileModelFromNode(node: SpinalNode): Promise<SpinalDocument | SpinalFile | undefined> {
	const file = await node.getElement(true);
	return file;
}

async function _addFileNodeToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<Lst | undefined> {
	let spinalDocument = await getFileModelFromNode(directoryNode);
	if (!spinalDocument) return;

	let directory: Lst | Directory | undefined = await getDirectoryElement(spinalDocument);

	if (directory) directory.push(file);

	return directory;
}

async function getDirectoryElement(spinalDocument: SpinalDocument | SpinalFile): Promise<Lst | Directory | undefined> {
	const isDirectory = spinalDocument._info?.model_type?.get() === DIRECTORY_MODEL_TYPE;
	if (!isDirectory) return;

	return new Promise<Lst | Directory | undefined>((resolve) => {
		spinalDocument._ptr.load((element: Lst | Directory) => {
			resolve(element);
		});
	});
}

export async function getFilesFromDirectory(directoryNode: SpinalFile | SpinalDocument): Promise<(SpinalDocument | SpinalFile)[]> {
	const directory = await getDirectoryElement(directoryNode); // Get the directory element (Lst or Directory) from the SpinalDocument
	const res: (SpinalDocument | SpinalFile)[] = [];

	if (!directory) return res;

	for (let i = 0; i < directory.length; i++) {
		const element = directory[i];
		res.push(element);
	}

	return res;
}

export async function createFileNode(file: SpinalDocument | SpinalFile): Promise<SpinalNode> {
	if (file instanceof SpinalDocument) return file.createNode();
	if (!file._info?.node) return createAndAddNodeToFile(file);

	return new Promise((resolve) => file._info.node.load((node: SpinalNode) => resolve(node)));
}

function createAndAddNodeToFile(file: SpinalFile): SpinalNode {
	const isDirectory = file._info?.model_type?.get() === DIRECTORY_MODEL_TYPE;
	const type = isDirectory ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
	const name = file.name.get();

	const node = new SpinalNode(name, type, file);

	file._info.add_attr({ node: new Ptr(node) });

	return node;
}

export async function _getFileChildren(file: SpinalDocument | SpinalFile, parentNode: SpinalNode): Promise<{ file: SpinalDocument; parent: SpinalNode }[]> {
	const children = await getFilesFromDirectory(file);
	const res = [];
	for (const child of children) {
		res.push({ file: child as SpinalDocument, parent: parentNode });
	}
	return res;
}

export async function _getFileAttributes(file: SpinalDocument | SpinalFile): Promise<{ name: string; nodeType: string; relationName: string }> {
	const name = file.name.get();
	const isDirectory = file._info?.model_type?.get() === DIRECTORY_MODEL_TYPE;
	const nodeType = isDirectory ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
	const relationName = nodeType === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;

	return { name, nodeType, relationName };
}

export async function _getFileAsBuffer(file: SpinalDocument | SpinalNode | SpinalFile, hubUrl: string = ""): Promise<Buffer> {
	if (file instanceof SpinalNode) file = (await getFileModelFromNode(file)) as SpinalDocument | SpinalFile;

	if (file instanceof SpinalDocument) return file.getCurrentVersionAsBuffer();

	const pathServerId = file._ptr.data.value;
	return getPathData(pathServerId, hubUrl);
}

export function getPathData(dynamicId: number, hubUrl: string = ""): Promise<Buffer> {
	if (hubUrl.endsWith("/")) hubUrl = hubUrl.slice(0, -1);

	const path = `${hubUrl}/sceen/_?u=${dynamicId}`;
	const client = axios.create({ baseURL: hubUrl });
	axiosRetry(client as any, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
	return client.get(path, { responseType: "arraybuffer" }).then((response) => {
		return Buffer.from(response.data);
		// return new Uint8Array(response.data);
	});
}

export async function convertTreeToFileBuffers(startNode: SpinalNode<any>, hubUrl: string = ""): Promise<{ name: string; serverId: number; path: string; buffer: Buffer }[]> {
	const queue = await getStarterQueue(startNode);
	const filesBuffers: { name: string; serverId: number; path: string; buffer: Buffer }[] = [];
	const alreadyProcessedNodes = new Set<number>();

	while (queue.length > 0) {
		const itemToProcess = queue.shift();
		if (!itemToProcess) continue;

		const { path, file } = itemToProcess;
		const serverId: number = (file._server_id as number) || 0;

		if (alreadyProcessedNodes.has(serverId)) continue;

		if (file._info.model_type?.get() !== DIRECTORY_MODEL_TYPE) {
			filesBuffers.push({ name: file.name.get(), serverId, path, buffer: await _getFileAsBuffer(file, hubUrl) });
		}

		if (file._info.model_type?.get() === DIRECTORY_MODEL_TYPE) {
			const children = await getFilesFromDirectory(file);

			for (const child of children) {
				queue.push({ path: `${path}/${child.name.get()}`, file: child as SpinalDocument });
			}
		}

		alreadyProcessedNodes.add(serverId);
	}

	return filesBuffers;
}

async function getStarterQueue(startNode: SpinalNode): Promise<{ path: string; file: SpinalDocument | SpinalFile }[]> {
	const queue: { node: SpinalNode; path: string }[] = [{ node: startNode, path: startNode.getName().get() }];
	const res: { path: string; file: SpinalDocument | SpinalFile }[] = [];

	while (queue.length > 0) {
		const data = queue.shift();
		if (!data) continue;

		const { node, path } = data;
		const type = node.getType().get();
		if (type === FILE_NODE_TYPE || type === DIRECTORY_NODE_TYPE) {
			res.push({ path, file: (await getFileModelFromNode(node)) as SpinalDocument | SpinalFile });
		}

		const children = await node.getChildren([TO_FILE_RELATION, TO_FOLDER_RELATION]);

		for (const child of children) {
			queue.push({ node: child, path: `${path}/${child.getName().get()}` });
		}
	}

	return res;
}

export async function _getOrCreateRootNode(node: SpinalNode, createIfNotExist: boolean = true): Promise<SpinalNode | null> {
	const children = await node.getChildren([TO_ROOT_DIRECTORY_RELATION]);
	if (children.length > 0) return children[0];

	if (!createIfNotExist) return null;

	const name = node.getName().get() + "_root_directory";

	const file = new SpinalDocument(name, new Lst(), { model_type: DIRECTORY_MODEL_TYPE, icon: "folder" });
	const directoryNode = await createFileNode(file);

	await node.addChild(directoryNode, TO_ROOT_DIRECTORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
	return directoryNode;
}

export async function removeFileNode(fileNode: SpinalNode): Promise<boolean> {
	const parentNodes = await fileNode.getParents([TO_FILE_RELATION, TO_FOLDER_RELATION]);
	const fileElement = await getFileModelFromNode(fileNode);

	const unlinkPromises = parentNodes.map(async (parent) => {
		if (parent.getType().get() === DIRECTORY_NODE_TYPE) {
			const directory = await parent.getElement(true);
			directory?.remove(fileElement as SpinalDocument);
		}
		return parent.removeChild(fileNode, TO_FILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
	});

	return Promise.all(unlinkPromises)
		.then(() => true)
		.catch((err) => false);
}

export function isFileVersion(fileVersion: any): fileVersion is FileVersion {
	return fileVersion?.constructor?.name === "FileVersion";
}

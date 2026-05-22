import { Path as SpinalPath, Directory as SpinalDirectory, Ptr, File } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { FileExplorer } from "../Models/FileExplorer";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_MODEL_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION, TO_ROOT_DIRECTORY_RELATION } from "../Models/constants";
import { FilesArgType } from "../interfaces";
import axiosRetry from "axios-retry";
import axios from "axios";
import { SpinalDocument } from "../models_spinalcom/SpinalDocument";
import VersionUtils from "./versionUtils";
import { FileVersion } from "../models_spinalcom/FileVersion";

export function convertFileToSpinalFile(files: FilesArgType, chunkSize: number = -1): SpinalDocument[] {
	const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
	if (!isFileList && !Array.isArray(files)) files = [files];

	const res: SpinalDocument[] = [];

	for (let i = 0; i < files.length; i++) {
		const element = files[i];

		let filePath: SpinalPath | undefined;

		// if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
		// else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));

		const hashes = VersionUtils.getInstance().convertFileToHashes(element.buffer || element, [], chunkSize);
		const fileVersion = new FileVersion({ version: 1, hashes });
		let file = new SpinalDocument(element.name, fileVersion, { model_type: FILE_MODEL_TYPE });

		res.push(file);
	}

	return res;
}

export function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode?: SpinalContext): Promise<SpinalNode> {
	let prom;
	if (contextNode) prom = parentNode.addChildInContext(childNode, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
	else prom = parentNode.addChild(childNode, relationName, SPINAL_RELATION_PTR_LST_TYPE);

	return prom.then(async (result) => {
		if (parentNode.getType().get() === DIRECTORY_NODE_TYPE) {
			const childSpinalDocument = await SpinalDocument.getFileModelFromNode(childNode);
			if (!childSpinalDocument) return result;

			await _addFileNodeToDirectory(parentNode, childSpinalDocument as SpinalDocument | SpinalDirectory);
		}

		return result;
	});
}

async function _addFileNodeToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalDirectory): Promise<SpinalDirectory | undefined> {
	let spinalDocument = await SpinalDocument.getFileModelFromNode(directoryNode);

	if (!spinalDocument) return;

	let directory: SpinalDirectory | undefined;

	if (spinalDocument instanceof SpinalDocument && spinalDocument.isDirectory()) {
		const directoryElement = await new Promise((resolve) => spinalDocument?._ptr?.load((e: SpinalDirectory) => resolve(e)));

		if (directoryElement instanceof SpinalDirectory) directory = directoryElement;
	}

	if (directory) directory.push(file);

	return directory;
}

export async function getFilesFromDirectory(directoryNode: File): Promise<(SpinalDocument | SpinalDirectory)[]> {
	const directory = await new Promise((resolve) => directoryNode.load((e: SpinalDirectory) => resolve(e)));
	const res: (SpinalDocument | SpinalDirectory)[] = [];

	if (directory instanceof SpinalDirectory) {
		for (let i = 0; i < directory.length; i++) {
			const element = directory[i];
			res.push(element);
		}
	}

	return res;
}

export function createFileNode(file: SpinalDocument): Promise<SpinalNode> {
	return file.createNode();
}

export async function _getFileChildren(file: File, parentNode: SpinalNode): Promise<{ file: SpinalDocument; parent: SpinalNode }[]> {
	const children = await getFilesFromDirectory(file);
	const res = [];
	for (const child of children) {
		res.push({ file: child as SpinalDocument, parent: parentNode });
	}
	return res;
}

export async function _getFileAttributes(file: File) {
	const name = file.name.get();

	const nodeType = file.isDirectory() ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
	const relationName = nodeType === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;

	return { name, nodeType, relationName };
}

export async function _getFileAsBuffer(file: SpinalDocument | SpinalNode | File, hubUrl: string = ""): Promise<Buffer> {
	if (file instanceof SpinalNode) file = (await SpinalDocument.getFileModelFromNode(file)) as SpinalDocument;

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
		const serverId = file._ptr.data.value;
		if (alreadyProcessedNodes.has(serverId)) continue;

		if (!file.isDirectory()) {
			filesBuffers.push({ name: file.name.get(), serverId, path, buffer: await _getFileAsBuffer(file, hubUrl) });
		}

		if (file.isDirectory()) {
			const children = await getFilesFromDirectory(file);

			for (const child of children) {
				queue.push({ path: `${path}/${child.name.get()}`, file: child as SpinalDocument });
			}
		}

		alreadyProcessedNodes.add(serverId);
	}

	return filesBuffers;
}

async function getStarterQueue(startNode: SpinalNode): Promise<{ path: string; file: SpinalDocument }[]> {
	const queue: { node: SpinalNode; path: string }[] = [{ node: startNode, path: startNode.getName().get() }];
	const res: { path: string; file: SpinalDocument }[] = [];

	while (queue.length > 0) {
		const data = queue.shift();
		if (!data) continue;

		const { node, path } = data;
		const type = node.getType().get();
		if (type === FILE_NODE_TYPE || type === DIRECTORY_NODE_TYPE) {
			res.push({ path, file: (await node.getElement(true)) as SpinalDocument });
		}

		const children = await node.getChildren();

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

	const file = new SpinalDocument(name, new SpinalDirectory(), { model_type: DIRECTORY_MODEL_TYPE, icon: "folder" });
	const directoryNode = await createFileNode(file);

	await node.addChild(directoryNode, TO_ROOT_DIRECTORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
	return directoryNode;
}

export async function removeFileNode(fileNode: SpinalNode): Promise<boolean> {
	const parentNodes = await fileNode.getParents([TO_FILE_RELATION, TO_FOLDER_RELATION]);
	const fileElement = await fileNode.getElement(true);

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

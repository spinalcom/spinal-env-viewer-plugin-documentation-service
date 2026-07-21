import { Path as SpinalPath, Lst, File as SpinalFile, Ptr, Directory, Path } from "spinal-core-connectorjs_type";
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { FileExplorer } from "../Models/FileExplorer";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_MODEL_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION, TO_ROOT_DIRECTORY_RELATION } from "../Models/constants";
import { fileFormat, FilesArgType, IFileBufferInfo, IFileFormattedInfo } from "../interfaces";
import axiosRetry from "axios-retry";
import axios from "axios";
import { SpinalDocument } from "../models_spinalcom/SpinalDocument";
import VersionUtils from "./versionUtils";
import { FileVersion } from "../models_spinalcom/FileVersion";
import { Readable } from "stream";
import SpinalDocumentary from "../Models/Documentary";

export async function convertFileToSpinalDocument(files: FilesArgType, chunkSize: number = -1): Promise<(SpinalDocument | SpinalFile)[]> {
	const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
	if (!isFileList && !Array.isArray(files)) files = [files];

	const res: (SpinalDocument | SpinalFile)[] = [];

	for (let i = 0; i < files.length; i++) {
		const element = files[i];

		// If the element is already a SpinalNode, we try to get its file model and add it to the result if it exists
		if (element instanceof SpinalNode) {
			const fileModel = await getFileModelFromNode(element);
			if (fileModel) res.push(fileModel);
			continue;
		}

		// If the element is already a SpinalDocument or SpinalFile, we add it to the result and ensure it has a node
		if (element instanceof SpinalFile || element instanceof SpinalDocument) {
			res.push(element);
			await createorGetFileNode(element);
			continue;
		}

		// let filePath: SpinalPath | undefined;

		// if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
		// else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));

		const hashes = await VersionUtils.getInstance().convertFileToHashes(element, [], chunkSize);
		const fileVersion = new FileVersion({ version: 1, hashes });
		let file = new SpinalDocument(element.name, fileVersion, { model_type: FILE_MODEL_TYPE });

		res.push(file);
	}

	return res;
}

export async function convertFileToBuffer(file: any): Promise<Buffer> {
	const buffer = file.buffer || file.data || file;

	if (Buffer.isBuffer(buffer)) return buffer;
	let arrayBuffer = buffer instanceof ArrayBuffer ? buffer : await buffer.arrayBuffer();

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

export async function createorGetFileNode(file: SpinalDocument | SpinalFile | SpinalNode): Promise<SpinalNode> {
	if (file instanceof SpinalNode) return file;

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

	if (file instanceof SpinalDocument) return file.getCurrentVersionAsBuffer(hubUrl);

	return new Promise((resolve, reject) => {
		file._ptr.load(async (element: SpinalPath) => {
			const data = await getPathData(element, hubUrl);
			resolve(data);
		});
	});
}

export async function getPathData(pathModel: Path, hubUrl: string = ""): Promise<Buffer> {
	await waitUntilPathIsLoaded(pathModel);
	const dynamicId = pathModel._server_id;
	if (hubUrl.endsWith("/")) hubUrl = hubUrl.slice(0, -1);

	const path = `${hubUrl}/sceen/_?u=${dynamicId}`;
	const client = axios.create({ baseURL: hubUrl });
	axiosRetry(client as any, { retries: 5, retryDelay: axiosRetry.exponentialDelay });
	return client.get(path, { responseType: "arraybuffer" }).then((response) => {
		return Buffer.from(response.data);
		// return new Uint8Array(response.data);
	});
}

export async function convertFileInTreeToSpecialFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format?: fileFormat, hubUrl: string = "", onlyFiles: boolean = false): Promise<IFileFormattedInfo[]> {
	const queue = await getStarterQueue(startNode);
	const filesBuffers: IFileFormattedInfo[] = [];
	const alreadyProcessedNodes = new Set<number>();

	while (queue.length > 0) {
		const itemToProcess = queue.shift();
		if (!itemToProcess) continue;

		const { path, file } = itemToProcess;
		const serverId: number = (file._server_id as number) || 0;

		if (alreadyProcessedNodes.has(serverId)) continue;

		const data = await convertFileToSpecialFormat(file, format, hubUrl);
		const isDirectory = file._info.model_type?.get() === DIRECTORY_MODEL_TYPE;

		// If the current file is not a directory or if we want to include files, we add it to the result
		if (!onlyFiles || (onlyFiles && !isDirectory)) {
			filesBuffers.push({ path, ...data });
		}

		// If the current file is a directory, we get its children and add them to the queue for processing
		if (isDirectory) {
			const children = await getFilesFromDirectory(file);

			for (const child of children) {
				queue.push({ path: `${path}/${child.name.get()}`, file: child as SpinalDocument });
			}
		}

		alreadyProcessedNodes.add(serverId);
	}

	return filesBuffers;
}

function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

export async function convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format?: fileFormat, hubUrl: string = ""): Promise<{ name: string; serverId: number; data: Buffer | string | NodeJS.ReadableStream }> {
	const name = file instanceof SpinalNode ? file.getName().get() : file.name.get();
	const fileType = file instanceof SpinalNode ? file.getType().get() : file._info.model_type?.get();

	const isDirectory = fileType === DIRECTORY_MODEL_TYPE;
	const fileData: any = { name, serverId: file._server_id as number, type: isDirectory ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE };

	if (!isDirectory && format) {
		const buffer = await _getFileAsBuffer(file, hubUrl);
		fileData.data = format === "base64" ? buffer.toString("base64") : format === "stream" ? bufferToStream(buffer) : buffer;
	}

	return fileData;
}

export async function convertTreeToFileBuffers(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl: string = ""): Promise<IFileBufferInfo[]> {
	return convertFileInTreeToSpecialFormat(startNode, "buffer", hubUrl, true).then((files) => {
		return files.map((file) => {
			return { name: file.name, path: file.path, buffer: file.data as Buffer };
		});
	});
}

async function getStarterQueue(startNode: SpinalNode | SpinalDocument | SpinalFile): Promise<{ path: string; file: SpinalDocument | SpinalFile }[]> {
	if (!(startNode instanceof SpinalNode)) startNode = await createorGetFileNode(startNode);

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
	if (children.length > 0) {
		await convertOldFilesToSpinalDocument(children[0]);
		return children[0];
	}

	if (!createIfNotExist) return null;

	const name = node.getName().get() + "_root_directory";

	const file = new SpinalDocument(name, new Lst(), { model_type: DIRECTORY_MODEL_TYPE, icon: "folder" });
	const directoryNode = await createorGetFileNode(file);

	await node.addChild(directoryNode, TO_ROOT_DIRECTORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
	return directoryNode;
}

export async function removeFileNode(fileNode: SpinalNode, contextNode?: SpinalNode): Promise<boolean> {
	let parentNodes: SpinalNode[];

	if (contextNode) parentNodes = await fileNode.getParentsInContext(contextNode, [TO_FILE_RELATION, TO_FOLDER_RELATION]);
	else parentNodes = await fileNode.getParents([TO_FILE_RELATION, TO_FOLDER_RELATION]);

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

async function waitUntilPathIsLoaded(pathModel: Path): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const waitTimeout = () => {
			if (pathModel.remaining.get() == 0 && pathModel._server_id) {
				resolve(true);
				return;
			}
			setTimeout(waitTimeout, 100);
		};
		waitTimeout();
	});
}

async function convertOldFilesToSpinalDocument(node: SpinalNode): Promise<boolean> {
	const directoryElement = await node.getElement(true);
	if (!directoryElement) return false;
	const documents: SpinalDocument[] = [];

	for (let i = 0; i < directoryElement.length; i++) {
		const element = directoryElement[i];
		let document: SpinalDocument;

		if (element instanceof SpinalDocument) {
			document = element;
		} else if (element instanceof SpinalFile) {
			const fakeVersion = await FileVersion.createFakeFileVersionInstance(element);
			const spinalDocument = new SpinalDocument(element.name.get(), fakeVersion, element._info.get());
			document = spinalDocument;
		}

		const fileNode = await createorGetFileNode(document!);
		documents.push(document!);
		node.addChild(fileNode, TO_FILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
	}

	if (directoryElement instanceof Lst || directoryElement instanceof Directory) directoryElement.clear();

	return true;
	// directory.clear();
}

export async function _getRootNodeParent(node: SpinalNode): Promise<SpinalNode[]> {
	const parents = await node.getParents([TO_FOLDER_RELATION, TO_FILE_RELATION]);

	const result: SpinalNode[] = [];
	for (const parent of parents) {
		if (parent.getName().get().endsWith("_root_directory")) {
			const grandParents = await parent.getParents([TO_ROOT_DIRECTORY_RELATION]);
			result.push(...grandParents);
		} else {
			result.push(parent);
		}
	}
	return result;
}

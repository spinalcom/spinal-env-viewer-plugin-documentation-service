import { File, Path, Directory, spinalCore, Ptr, Lst } from "spinal-core-connectorjs";
import { FileExplorer } from "../Models/FileExplorer";
import { SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { addChildrenToNode, convertTreeToFileBuffers, removeFileNode } from "../utils/files";
import { IFileBufferInfo } from "../interfaces";
import { DIRECTORY_MODEL_TYPE, DIRECTORY_NODE_TYPE, FILE_MODEL_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "../Models/constants";
import FileVersion from "./FileVersion";
import VersionUtils from "../utils/versionUtils";

export default class SpinalDocument extends File {
	private _node: SpinalNode | null = null;

	constructor(name?: string, initialVersion?: FileVersion | Directory | Lst, info: { [key: string]: any } = {}) {
		super();
		if (!name || !initialVersion) return;

		const isDirectory = initialVersion instanceof Lst || initialVersion instanceof Directory;

		if (!info.icon) info.icon = isDirectory ? "folder" : "file";
		if (!info.model_type) info.model_type = isDirectory ? DIRECTORY_MODEL_TYPE : FILE_MODEL_TYPE;

		this.mod_attr("name", name);
		this.mod_attr("_info", info);

		const element = isDirectory ? initialVersion : undefined;
		if (element) this.mod_attr("_ptr", new Ptr(element));

		this._addNodeToInfo();

		if (initialVersion instanceof FileVersion) {
			this.add_attr({
				currentVersion: new Ptr(initialVersion),
				versionHistory: new Ptr(new Lst([initialVersion])),
				hashes: new Lst(Array.from(initialVersion.hashes)),
			});
		}

		// this.add_attr({});

		// this.createNode();
	}

	async updateVersion(buffer: Buffer, hubUrl: string = "", chunkSize?: number): Promise<void> {
		if (this.isDirectory()) throw new Error("Cannot update version of a directory.");

		const hashes = VersionUtils.getInstance().convertFileToHashes(buffer, Array.from(this.hashes), chunkSize);
		const versionHistory = await this._loadVersionHistory();

		const newVersion = new FileVersion({ version: versionHistory.length + 1, hashes });

		versionHistory.push(newVersion); // Add new version to history

		this.hashes.concat(newVersion.hashes); // Update file hashes with new version's hashes

		this.mod_attr("currentVersion", new Ptr(newVersion)); // Update current version pointer
	}

	getCurrentVersion(): Promise<FileVersion> {
		if (this.isDirectory()) throw new Error("Directories do not have versions.");

		return new Promise((resolve, reject) => {
			try {
				this.currentVersion?.load((version: FileVersion) => resolve(version));
			} catch (error) {
				reject(error);
			}
		});
	}

	async getCurrentVersionAsBuffer(hubUrl: string = ""): Promise<Buffer> {
		if (this.isDirectory()) throw new Error("Directories do not have versions.");

		const currentVersion = await this.getCurrentVersion();
		return currentVersion.getAsBuffer(hubUrl);
	}

	async getVersionHistory(): Promise<FileVersion[]> {
		if (this.isDirectory()) throw new Error("Directories do not have versions.");

		const historyLst = await this._loadVersionHistory();
		return Array.from(historyLst);
	}

	async linkToNode(parentNode: SpinalNode, contextNode?: SpinalContext): Promise<SpinalNode> {
		if (!this._node) await this.createNode();

		const relationName = this.isDirectory() ? TO_FOLDER_RELATION : TO_FILE_RELATION;
		return addChildrenToNode(parentNode, this._node as SpinalNode, relationName, contextNode);
	}

	async remove(): Promise<boolean> {
		if (!this._node) this._node = (await this.getNode()) as SpinalNode;
		if (!this._node) return false;

		if (!this.isDirectory()) return removeFileNode(this._node);

		const files = await this._node.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
		const promises: Promise<boolean | boolean[]>[] = [];

		for (const file of files) {
			promises.push(file.remove());
		}

		return Promise.all(promises).then((result) => {
			return true;
		});
	}

	getNode(): Promise<SpinalNode | null> {
		if (this._node) return Promise.resolve(this._node);

		const infoAttr: ({ node?: spinal.Ptr<SpinalNode> } & { [key: string]: any }) | null = this._info;

		const nodePtr = infoAttr?.node;

		if (!nodePtr) return Promise.resolve(null);

		return new Promise((resolve) =>
			nodePtr.load((node: SpinalNode) => {
				this._node = node;
				resolve(node);
			}),
		);
	}

	static async getFileModelFromNode(node: SpinalNode): Promise<SpinalDocument | undefined> {
		const file = await node.getElement(true);
		return file;
	}

	async getParentNodes() {
		const fileNode = await this.getNode();
		if (!fileNode) return [];

		const parents = await fileNode.getParents();
		return parents;
	}

	async getFilesTreeAsBuffers(hubUrl: string = ""): Promise<IFileBufferInfo[]> {
		const node = await this.getNode();
		if (!node) return [];

		return convertTreeToFileBuffers(node, hubUrl);
	}

	async createNode(): Promise<SpinalNode> {
		const node = await this.getNode();
		if (node) return node;

		if (!this._node) this._node = this._addNodeToInfo();

		return this._node;
	}

	isDirectory(): boolean {
		return this._info?.model_type?.get() === DIRECTORY_MODEL_TYPE;
	}

	private _addNodeToInfo() {
		const type = this.isDirectory() ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
		const name = this.name.get();

		const node = new SpinalNode(name, type, this);

		this._info.add_attr({ node: new Ptr(node) });

		return node;
	}

	private _loadVersionHistory(): Promise<Lst<FileVersion>> {
		return new Promise((resolve, reject) => {
			try {
				this.versionHistory?.load((history: Lst<FileVersion>) => resolve(history));
			} catch (error) {
				reject(error);
			}
		});
	}
}

spinalCore.register_models([SpinalDocument]);
export { SpinalDocument };

import { File as SpinalFileModel } from "spinal-core-connectorjs_type";
import { SpinalDocument } from "../models_spinalcom";

export type FilesArgType = (SpinalFileModel | { name: string; buffer: Buffer })[] | FileList | SpinalDocument | any;

export type fileFormat = "buffer" | "base64" | "stream";

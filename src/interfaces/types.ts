import { File as SpinalFileModel } from "spinal-core-connectorjs_type";

export type FilesArgType = (SpinalFileModel | { name: string; buffer: Buffer })[] | FileList | any;

export declare class FileExplorer {
    static getDirectory(selectedNode: any): Promise<any>;
    static getNbChildren(selectedNode: any): Promise<any>;
    static createDirectory(selectedNode: any): Promise<any>;
    static _getFileType(file: any): any;
    static addFileUpload(directory: any, uploadFileList: any): any;
}

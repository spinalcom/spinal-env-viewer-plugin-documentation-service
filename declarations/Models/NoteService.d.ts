import { SpinalNode } from "spinal-env-viewer-graph-service";
import { SpinalNote, ViewStateInterface } from "spinal-models-documentation";
declare class NoteService {
    constructor();
    addNote(node: any, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.Model, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode<any>>;
    addFileAsNote(node: SpinalNode<any>, files: any, userInfo: {
        username: string;
        userId: number;
    }, noteContextId?: string, noteGroupId?: string): Promise<void[]>;
    getNotes(node: any): Promise<any>;
    editNote(element: any, note: string): void;
    predicate(node: any): boolean;
    linkNoteToGroup(contextId: string, groupId: string, noteId: string): void;
    createDefaultContext(): Promise<any>;
    createDefaultCategory(): Promise<any>;
    createDefaultGroup(): Promise<any>;
    createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    private _getOrCreateFileDirectory;
}
export default NoteService;

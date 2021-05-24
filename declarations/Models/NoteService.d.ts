import { SpinalNode } from "spinal-env-viewer-graph-service";
import { SpinalNote, ViewStateInterface } from "spinal-models-documentation";
declare class NoteService {
    constructor();
    addNote(node: SpinalNode<any>, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.Model, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode<any>>;
    addFileAsNote(node: SpinalNode<any>, files: any, userInfo: {
        username: string;
        userId: number;
    }, noteContextId?: string, noteGroupId?: string): Promise<any>;
    getNotes(node: SpinalNode<any>): Promise<Array<{
        element: SpinalNote;
        selectedNode: SpinalNode<any>;
    }>>;
    editNote(element: SpinalNote, note: string): SpinalNote;
    linkNoteToGroup(contextId: string, groupId: string, noteId: string): any;
    createDefaultContext(): Promise<any>;
    createDefaultCategory(): Promise<any>;
    createDefaultGroup(): Promise<any>;
    createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    private _getOrCreateFileDirectory;
}
declare const noteService: NoteService;
export { NoteService, noteService };
export default NoteService;

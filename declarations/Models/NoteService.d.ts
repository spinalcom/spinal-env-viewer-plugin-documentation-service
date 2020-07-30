import { SpinalNode } from "spinal-env-viewer-graph-service";
import { SpinalNote } from "spinal-models-documentation";
declare class NoteService {
    constructor();
    s: any;
    addNote(node: any, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.Model): Promise<SpinalNode<any>>;
    getNotes(node: any): Promise<any>;
    editNote(element: any, note: string): void;
    predicate(node: any): boolean;
    linkNoteToGroup(contextId: string, groupId: string, noteId: string): void;
    createDefaultContext(): Promise<any>;
    createDefaultCategory(): Promise<any>;
    createDefaultGroup(): Promise<any>;
    createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote): Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
}
export default NoteService;

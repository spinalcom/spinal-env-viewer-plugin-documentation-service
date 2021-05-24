import { AttributeService, attributeService } from "./Models/AttributeService";
import { NoteService, noteService } from "./Models/NoteService";
import { UrlService, urlService } from "./Models/UrlService";
import { FileExplorer } from "./Models/FileExplorer";
declare class ServiceDocumentation {
}
interface ServiceDocumentation extends AttributeService, NoteService, UrlService {
}
declare const serviceDocumentation: ServiceDocumentation;
export { ServiceDocumentation, serviceDocumentation, attributeService, noteService, urlService, FileExplorer };
export default serviceDocumentation;

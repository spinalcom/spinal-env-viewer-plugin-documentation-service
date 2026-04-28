import { AttributeService } from './AttributeService';
import { NoteService } from './NoteService';
import { UrlService } from './UrlService';
import { SpinalDocumentary } from "./Documentary";
declare class ServiceDocumentation {
}
interface ServiceDocumentation extends AttributeService, NoteService, UrlService, SpinalDocumentary {
}
declare const serviceDocumentation: ServiceDocumentation;
export { ServiceDocumentation, serviceDocumentation };

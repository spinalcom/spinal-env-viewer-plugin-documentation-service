import { AttributeService } from './AttributeService';
import { NoteService } from './NoteService';
import { UrlService } from './UrlService';
declare class ServiceDocumentation {
}
interface ServiceDocumentation extends AttributeService, NoteService, UrlService {
}
declare const serviceDocumentation: ServiceDocumentation;
export { ServiceDocumentation, serviceDocumentation };

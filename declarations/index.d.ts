import AttributeService from "./Models/AttributeService";
import NoteService from "./Models/NoteService";
import UrlService from "./Models/UrlService";
declare class ServiceDocumentation {
}
interface ServiceDocumentation extends AttributeService, NoteService, UrlService {
}
declare const serviceDocumentation: ServiceDocumentation;
export { serviceDocumentation };
export default serviceDocumentation;

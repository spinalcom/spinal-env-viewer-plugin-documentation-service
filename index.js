import {
  SpinalGraph,
  SpinalContext,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinalgraph';
import bimObjectService from 'spinal-env-viewer-plugin-bimobjectservice';
import {
  SpinalURL
} from 'spinal-models-cde';

let cdeservice = {
  graph: null,
  context: null,
  async getGraph() {
    if (this.graph === null) {
      let forgeFile = await window.spinal.spinalSystem.getModel();

      if (!forgeFile.hasOwnProperty('graph')) {
        forgeFile.add_attr({
          graph: new SpinalGraph(),
        });
      }
      this.graph = forgeFile.graph;
    }
    return this.graph;
  },
  async getContext(name) {
    let graph = await this.getGraph();
    let selectedContext = await graph.getContext(name);
    if (selectedContext === 'undefined') {
      selectedContext = new SpinalContext(name);
      graph.addContext(selectedContext);
    }
    return selectedContext;
  },
  async getBIMObject(dbid) {},
  async addFile(context, parendNode, file, name) {
    // this.getContext("File");
  },
  async addURL(parentNode, nameURL, URL) {
    let myChild = new SpinalURL(nameURL, URL)

    if (parentNode instanceof SpinalNode)
      parentNode.addChild(myChild, "hasURL", SPINAL_RELATION_PTR_LST_TYPE);
    else {
      let myParentNode = await bimObjectService.createBIMObject(parentNode,
        "bimObject_" +
        parentNode)
      console.log(myParentNode);
      let myURLNode = await myParentNode.addChild(myChild, "hasURL",
        SPINAL_RELATION_PTR_LST_TYPE);
      myURLNode.info.name.set(nameURL)
      return myParentNode;
    }
    // this.getContext("URL");
  },
  async addAttribute(context, parendNode, attributes, name) {
    // this.getContext("Attribute");
  },
  async addNote(context, parendNode, note, name) {
    // this.getContext("Note");
  },
};

export default cdeservice;
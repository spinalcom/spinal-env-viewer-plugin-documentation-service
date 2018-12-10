import {
  SPINAL_RELATION_PTR_LST_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  SpinalAttribute,
  SpinalURL
} from 'spinal-models-documentation';

class DocumentationService {

  addNote(context, parentNode, note, name) {
    // this.getContext("Note");
    console.log(context, parentNode, note, name);
  }

  addURL(parentNode, nameURL, URL) {
    if (nameURL != undefined && URL != undefined && URL != "" && nameURL !=
      "") {
      let myChild = new SpinalURL(nameURL, URL);
      //TODO CHECK relation type. RElation type wanted SPINAL_RELATION_PTR_LST_TYPE
      SpinalGraphService.addChildAndCreateNode(parentNode.id.get(),
        myChild, "hasURL", SPINAL_RELATION_PTR_LST_TYPE);
    }
  }


  async getURL(parentNode) {
    const children = await SpinalGraphService.getChildren(parentNode.id.get(),
      ['hasURL']);
    const res = [];
    for (let child of children) {
      res.push(child.element.load());
    }
    return Promise.all(res);
  }

  async getAttributes(parentNode) {
    const res = [];
    const children = await SpinalGraphService.getChildren(parentNode.info.id.get(),
      ['hasAttributes']);

    for (let child of children) {
      res.push(child.element.load());
    }
    return Promise.all(res);
  }

  addAttribute(parentNode, label, value) {
    if (label != undefined && value != undefined && value != "" && label !=
      "") {
      let myChildElement = new SpinalAttribute(label, value);
      let idNewNode = SpinalGraphService.createNode({
        name: label,
        value,
        type: "SpinalAttribute"
      }, myChildElement)
      SpinalGraphService.addChild(parentNode.info.id.get(),
        idNewNode,
        'hasAttributes', SPINAL_RELATION_PTR_LST_TYPE);
    }
  }


}

export const serviceDocumentation = new DocumentationService();
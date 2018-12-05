import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinalgraph';

import {
  SpinalURL,
  SpinalAttribute
} from 'spinal-models-documentation';

class DocumentationService {

  addNote(context, parentNode, note, name) {
    // this.getContext("Note");
    console.log(context, parentNode, note, name)
  }

  async addURL(parentNode, nameURL, URL) {
    if (nameURL != undefined && URL != undefined && URL != "" && nameURL != "") {
      let myChild = new SpinalURL(nameURL, URL);

      if (parentNode instanceof SpinalNode)
        await parentNode.addChild(myChild, 'hasURL', SPINAL_RELATION_PTR_LST_TYPE);
      else {
        console.log("bad request add url");
      }
    }
  }

  async getURL(BIMObject) {
    const urlNodes = await BIMObject.getChildren("hasAttributes");
    const urls = [];

    for (let url of urlNodes) {
      urls.push(url.getElement());
    }

    return Promise.all(urls);
  }

  async addAttribute(parentNode, label, value) {
    if (label != undefined && value != undefined && value != "" && label != "") {
      let myChild = new SpinalAttribute(label, value);

      if (parentNode instanceof SpinalNode)
        await parentNode.addChild(
          myChild,
          'hasAttributes',
          SPINAL_RELATION_PTR_LST_TYPE
        );
    } else {
      console.log("bad request add attributes")
    }
  }

  async getAttributes(BIMObject) {
    const attrNodes = await BIMObject.getChildren("hasAttributes");
    const attrs = [];

    for (let attr of attrNodes) {
      attrs.push(attr.getElement());
    }

    return Promise.all(attrs);
  }
}
export const serviceDocumentation = new DocumentationService()

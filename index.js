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
  addURL(parentNode, nameURL, URL) {
    if (nameURL != undefined && URL != undefined && URL != "" && nameURL !=
      "") {
      let myChild = new SpinalURL(nameURL, URL);

      if (parentNode instanceof SpinalNode)
        parentNode.addChild(myChild, 'hasURL',
          SPINAL_RELATION_PTR_LST_TYPE);
      else {
        console.log("bad request add url")

      }
    }

  }

  getURL(parentNode) {
    let tab = [];
    return parentNode
      .getChildren(['hasURL'])
      .then(myURLList => {
        // console.log(myURLList);
        for (let i = 0; i < myURLList.length; i++) {
          const urlNode = myURLList[i];
          // console.log(urlNode);
          urlNode.element.ptr.load(url => {
            tab.push(url);
          });
        }
      })
      .then(() => tab);
  }

  addAttribute(parentNode, label, value) {
    // this.getContext("Attribute");
    if (label != undefined && value != undefined && value != "" && label !=
      "") {
      let myChild = new SpinalAttribute(label, value);

      if (parentNode instanceof SpinalNode)
        parentNode.addChild(
          myChild,
          'hasAttributes',
          SPINAL_RELATION_PTR_LST_TYPE
        );
    } else {
      console.log("bad request add attributes")
    }
  }

  getAttributes(parentNode) {
    let tab = [];
    return parentNode
      .getChildren(['hasAttributes'])
      .then(myAttributesList => {
        // console.log(myAttributesList);
        for (let i = 0; i < myAttributesList.length; i++) {
          const urlNode = myAttributesList[i];
          // console.log(urlNode);
          urlNode.element.ptr.load(url => {
            tab.push(url);
          });
        }
      })
      .then(() => tab);
  }
}
export const serviceDocumentation = new DocumentationService()
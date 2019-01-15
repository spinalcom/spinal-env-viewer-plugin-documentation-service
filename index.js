import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE
} from 'spinal-model-graph';

import {
  SpinalURL,
  SpinalAttribute,
  SpinalNote,
} from 'spinal-models-documentation';

class DocumentationService {
  removeNode(node) {
    node.removeFromGraph();
  }

  async addURL(parentNode, nameURL, URL) {
    if (
      nameURL != undefined &&
      URL != undefined &&
      URL != '' &&
      nameURL != ''
    ) {
      let myChild = new SpinalURL(nameURL, URL);

      if (parentNode instanceof SpinalNode) {
        let node = await parentNode.addChild(
          myChild,
          'hasURL',
          SPINAL_RELATION_PTR_LST_TYPE
        );
        node.info.name.set('[URL] ' + nameURL);
        node.info.type.set('SpinalURL');
      } else {
        console.log('bad request add url');
      }
    }
  }

  async getURL(parentNode) {
    const urlNodes = await parentNode.getChildren('hasURL');
    const urls = [];

    for (let url of urlNodes) {
      let element = url.getElement();
      urls.push(
        element.then(loadedURL => {
          return {
            element: loadedURL,
            node: url,
          };
        })
      );
    }

    return Promise.all(urls);
  }

  async addAttribute(parentNode, label, value) {
    if (
      label != undefined &&
      value != undefined &&
      value != '' &&
      label != ''
    ) {
      let myChild = new SpinalAttribute(label, value);

      if (parentNode instanceof SpinalNode) {
        let node = await parentNode.addChild(
          myChild,
          'hasAttributes',
          SPINAL_RELATION_PTR_LST_TYPE
        );
        node.info.name.set('[Attributes] ' + label);
        node.info.type.set('SpinalAttributes');
      }
    } else {
      console.log('bad request add attributes');
    }
  }

  async getAttributes(parentNode) {
    const attrNodes = await parentNode.getChildren('hasAttributes');
    const attrs = [];

    for (let attr of attrNodes) {
      let element = attr.getElement();
      attrs.push(
        element.then(loadedElement => {
          return {
            element: loadedElement,
            node: attr,
          };
        })
      );
    }

    return Promise.all(attrs);
  }
  async addNote(parentNode, username, note) {
    console.log(parentNode);
    if (parentNode instanceof SpinalNode) {
      let mySpinalNote = new SpinalNote(username, note);
      let node = await parentNode.addChild(
        mySpinalNote,
        'hasNotes',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.type.set('SpinalNote');
    } else {
      console.log('bad request add attributes');
    }
  }
  async getNotes(parentNode) {
    if (parentNode instanceof SpinalNode) {
      const notesChildren = await parentNode.getChildren('hasNotes');
      const notes = [];
      for (let noteNode of notesChildren) {
        let element = noteNode.getElement();
        notes.push(
          element.then(loadedElement => {
            return {
              element: loadedElement,
              selectedNode: noteNode,
            };
          })
        );
      }
      return Promise.all(notes);
    } else {
      console.log('bad request add attributes');
    }
  }

  editNote(element, note) {
    console.log(element)
    let date = new Date();
    element.message.set(note);
    element.date.set(date);
  }
}
export const serviceDocumentation = new DocumentationService();
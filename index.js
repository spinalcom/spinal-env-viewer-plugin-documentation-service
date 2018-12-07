import {
  SPINAL_RELATION_PTR_LST_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  SpinalAttribute,
  SpinalURL
} from 'spinal-models-documentation';

class DocumentationService {

  addNote( context, parentNode, note, name ) {
    // this.getContext("Note");
    console.log( context, parentNode, note, name );
  }

  addURL( parentNode, nameURL, URL ) {
    console.log( "url", parentNode );

    if (nameURL != undefined && URL != undefined && URL != "" && nameURL != "") {
      let myChild = new SpinalURL( nameURL, URL );
      //TODO CHECK relation type. RElation type wanted SPINAL_RELATION_PTR_LST_TYPE
      SpinalGraphService.addChildAndCreateNode( parentNode.getId().get(), myChild, "hasURL", SPINAL_RELATION_PTR_LST_TYPE );
    }
  }

  getURL( parentNode ) {
    let tab = [];
    return SpinalGraphService
      .getChildren( parentNode.getId().get(), ['hasURL'] )
      .then( myURLList => {
        // console.log(myURLList);
        for (let i = 0; i < myURLList.length; i++) {
          const urlNode = myURLList[i];
          // console.log(urlNode);
          urlNode.element.ptr.load( url => {
            tab.push( url );
          } );
        }
      } )
      .then( () => tab );
  }

  addAttribute( parentNode, label, value ) {
    // this.getContext("Attribute");
    console.log( parentNode );

    if (label != undefined && value != undefined && value != "" && label !=
      "") {
      let myChild = new SpinalAttribute( label, value );
      SpinalGraphService.addChild( parentNode.getId().get(), myChild, 'hasAttributes', SPINAL_RELATION_PTR_LST_TYPE );
    }
  }

  getAttributes( parentNode ) {
    let tab = [];
    return SpinalGraphService
      .getChildren( parentNode.getId().get(), ['hasAttributes'] )
      .then( myAttributesList => {
        // console.log(myAttributesList);
        for (let i = 0; i < myAttributesList.length; i++) {
          const urlNode = myAttributesList[i];
          // console.log(urlNode);
          urlNode.element.ptr.load( url => {
            tab.push( url );
          } );
        }
      } )
      .then( () => tab );
  }
}

export const serviceDocumentation = new DocumentationService();

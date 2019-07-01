import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE
} from 'spinal-model-graph';

import {
  SpinalURL,
  SpinalAttribute,
  SpinalNote,
} from 'spinal-models-documentation';
var $q = require('q');
import bimObjectService from 'spinal-env-viewer-plugin-bimobjectservice';
import {
  ROOMS_TO_ELEMENT_RELATION,
  EQUIPMENTS_TO_ELEMENT_RELATION
} from "spinal-env-viewer-room-manager/js/service";
// var spinalCore = require('spinalcore');
class DocumentationService {

  removeNode(node) {
    node.removeFromGraph();
  }

  ///////////////////////////////////////////////////////////////////////////////////
  //      Spinal URL function                                                 //
  ///////////////////////////////////////////////////////////////////////////////////
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

  getParents(selectedNode, relationNames) {
    const promises = [];
    console.log(selectedNode);
    if (selectedNode == undefined) {
      return Promise.resolve([])
    }
    if (typeof relationNames === "undefined" || relationNames.length === 0) {
      relationNames = selectedNode.parents.keys();
    }

    for (let name of relationNames) {
      const list = selectedNode.parents.getElement(name);
      if (list != undefined) {
        for (let i = 0; i < list.length; i++) {
          promises.push(list[i].load().then(relation => {
            return relation.getParent();
          }));
        }
      }
    }
    return Promise.all(promises);
  }

  async getParentGroup(selectedNode) {
    // console.log("test of urlFRom parents");
    return this.getParents(selectedNode, [ROOMS_TO_ELEMENT_RELATION,
      EQUIPMENTS_TO_ELEMENT_RELATION
    ]).then((res) => {
      return res
    })
  }

  async deleteURL(parentNode, label) {
    const urlNodes = await parentNode.getChildren('hasURL');
    const urls = [];

    for (let url of urlNodes) {
      let element = url.getElement();
      element.then(loadedURL => {
        if (loadedURL.label.get() == label) {
          console.log("delete node url");
          url.removeFromGraph();
        }
      })
    }
    return Promise.all(urls);
  }
  ///////////////////////////////////////////////////////////////////////////////////
  //      Spinal attributes function                                                 //
  ///////////////////////////////////////////////////////////////////////////////////

  async addCategoryAttribute(parentNode, label) {
    // console.log(parentNode, label);
    let bool = true;
    if (parentNode instanceof SpinalNode) {
      // cannot add category with same name
      let category = await parentNode.getChildren("hasCategoryAttributes");
      for (let i = 0; i < category.length; i++) {
        const element = category[i];
        if (element.info.name.get() == label) {
          // do not create category
          bool = false;
        }
      }
      if (bool) {
        let categoryNode = new SpinalNode(label, "categoryAttributes",
          new Lst());
        let node = await parentNode.addChild(categoryNode,
          "hasCategoryAttributes", SPINAL_RELATION_PTR_LST_TYPE)
        return node;
      }
    }
  }
  async getCategory(parentNode) {
    const attrNodes = await parentNode.getChildren('hasCategoryAttributes');
    const attrs = [];
    for (let attr of attrNodes) {
      let element = attr.getElement();
      attrs.push(
        element.then(loadedElement => {
          return {
            element: loadedElement,
            nameCat: attr.info.name.get(),
            node: attr,
          };
        })
      );
    }
    return Promise.all(attrs);
  }
  async getCategoryByName(parentNode, categoryName) {
    // console.log(categoryName);
    let catArray = await this.getCategory(parentNode);
    for (let i = 0; i < catArray.length; i++) {
      const element = catArray[i];
      if (element.node.info.name.get() == categoryName) {
        return element
      }
    }
  }
  async getAttributesByCategory(parentNode, categoryName) {
    let cat = await this.getCategoryByName(parentNode, categoryName)
    let tab = [];
    for (let i = 0; i < cat.element.length; i++) {
      const element = cat.element[i];
      tab.push(element);
    }
    return tab;
  }
  async addAttributeByCategory(parentNode, category, label, value) {
    // console.log(category, label, value);
    let status = true;
    if (
      label != undefined &&
      value != undefined &&
      value != '' &&
      label != ''
    ) {
      let allAttributes = await this.getAllAttributes(parentNode);
      for (let i = 0; i < allAttributes.length; i++) {
        const element = allAttributes[i];
        if (element.label.get() == label) {
          status = false;
        }
      }
      if (status) {
        if (category != undefined) {
          let myChild = new SpinalAttribute(label, value);
          category.element.push(myChild);
        }
      }
    }
  }
  async addAttributeByCategoryName(parentNode, categoryName, label, value) {
    // console.log(category, label, value);
    const _this = this;
    let status = true;
    let categoryNode = undefined;
    let cat = this.getCategoryByName(parentNode, categoryName)
    if (
      label != undefined &&
      value != undefined &&
      value != '' &&
      label != ''
    ) {
      let allAttributes = await this.getAllAttributes(parentNode);
      for (let i = 0; i < allAttributes.length; i++) {
        const element = allAttributes[i];
        if (element.label.get() == label) {
          status = false;
        }
      }
      if (status) {
        cat.then(async function create(category) {
          if (category == undefined) {
            // create category
            // console.log(parentNode);
            categoryNode = await _this.addCategoryAttribute(
              parentNode,
              categoryName
            );
            categoryNode.getElement().then((element) => {
              let myChild = new SpinalAttribute(label, value);
              element.push(myChild);
            });
            // this.addAttributeByCategory()
            // categoryNode.element.load((myLst) => {
            //   let myChild = new SpinalAttribute(label, value);
            //   myLst.element.push(myChild);
            // })

          } else {
            let myChild = new SpinalAttribute(label, value);
            category.element.push(myChild);
            // add attributes in category found
          }
        })
      }
    }
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
  async getAllAttributes(parentNode) {
    let promisArray = [];
    const categoryArray = await this.getCategory(parentNode);
    let arrayAttributes = [];

    for (let i = 0; i < categoryArray.length; i++) {
      const element = categoryArray[i];
      const tab = this.getAttributesByCategory(parentNode,
        element.node.info.name.get())
      promisArray.push(tab.then((res) => {
        arrayAttributes.push(...res)
      }))
    }
    await Promise.all(promisArray);
    return arrayAttributes;
  }
  async getAttributes(parentNode) {
    // get hasCategoryAttributes and return list of all attributes
    const attrNodes = await parentNode.getChildren('hasAttributes');
    const attrs = [];
    console.log(attrNodes);

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

  compareAttr(listAttr1, listAttr2) {
    let sharedAttributes = []
    for (let j = 0; j < listAttr1.length; j++) {
      const element = listAttr1[j];
      for (let k = 0; k < listAttr2.length; k++) {
        const element2 = listAttr2[k];
        if (element.label.get() == element2.label.get()) {
          sharedAttributes.push(element);
        }
      }
    }
    return sharedAttributes
  }

  async getAttributesShared(listOfdbId) {
    // console.log(listOfdbId);
    let _this = this;
    let listOfNode = [];
    let sharedAttributes = []
    let attrToCompare = []
    for (let i = 0; i < listOfdbId.length; i++) {
      const dbId = listOfdbId[i]
      listOfNode.push(bimObjectService.getBIMObject(dbId));
    }
    return Promise.all(listOfNode).then(function(bimObjectNodes) {
      // console.log(bimObjectNodes);
      // get category for the first BO
      return _this.getAllAttributes(bimObjectNodes[0]).then((res) => {
        attrToCompare = res;
        let arrayOfProm = []

        for (let i = 1; i < bimObjectNodes.length; i++) {
          const BIMObject = bimObjectNodes[i];

          arrayOfProm.push(
            _this.getAllAttributes(BIMObject).then((
              attributesList) => {
              attrToCompare = _this.compareAttr(attrToCompare,
                attributesList);
              return attrToCompare;
            })
          )
        }
        // return 
        return Promise.all(arrayOfProm).then((arr) => {
          return attrToCompare
        });
      })

    });
  }
  findAttributesByLabel(parentNode, label) {
    this.getAttributes(parentNode).then((data) => {
      console.log(data);
    })

  }

  removeAttributesByLabel(parentNode, label) {
    console.log(parentNode);
    console.log(label);
    this.findAttributesByLabel(parentNode, label);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  //      SPinal notes function                                                    //
  ///////////////////////////////////////////////////////////////////////////////////
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
    console.log(element);
    let date = new Date();
    element.message.set(note);
    element.date.set(date);
  }
  predicate(node) {
    console.log(node);
    return true;
  }

  ///////////////////////////////////////////////////////////////////////////////////
  //      export to drive function                                                 //
  ///////////////////////////////////////////////////////////////////////////////////
  async exportToDrive(context) {
    let driveDirectory = await this.getDriveDirectoryOfForgeFile();
    // now we will create a related directory of graph
    let ViewerDirectoryInDrive = await this.getDriveLinkedDirectory(
      driveDirectory
    );
    // console.log (ViewerDirectoryInDrive, context);
    let name = context.info.name.get();
    let obj = {};
    obj[name] = {
      _info: {
        relation: Object.keys(context.parents).pop(),
      },
    };
    let path = this.getPathLinkedDirectory() + "/" + context.info.name.get();
    let depth = 0;
    let contextDirectory = await this.createDirectory(context);
    ViewerDirectoryInDrive.add_file(context.info.name.get(),
      contextDirectory, {
        model_type: "Directory",
        icon: "folder",
        node: context
      })
    this.startRecursiveExport(context, contextDirectory, context);
  }
  async startRecursiveExport(node, directory, context) {
    let result = await node.getChildrenInContext(context);
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      this.newTryRecursiveExport(element, directory, context);
    }
  }
  cutLastElementOfPath(path) {
    let pathTab = path.split('/');
    let str = '';
    for (let i = 1; i < pathTab.length - 1; i++) {
      const element = pathTab[i];
      str = str + '/' + element;
    }
    return str;
  }
  getDriveDirectoryOfForgeFile() {
    let forgeFilePath = window.spinal.spinalSystem.getPath();
    let drivePath = this.cutLastElementOfPath(forgeFilePath);
    return window.spinal.spinalSystem.load(drivePath).then(directory => {
      return directory;
    });
  }
  getDriveLinkedDirectory(directory) {
    let myCheck = false;
    let myFile = undefined;
    for (let i = 0; i < directory.length; i++) {
      const element = directory[i];
      if (element.name.get() == 'ViewerLinkedDirectory') {
        myCheck = true;
        myFile = element;
      }
    }
    if (myCheck) {
      return new Promise(resolve => {
        myFile._ptr.load(FileDirectory => {
          resolve(FileDirectory);
        });
      });
    } else {
      // il faut créer le directory
      let myDirectory = new Directory();

      let myFile = new File('ViewerLinkedDirectory', myDirectory);
      directory.push(myFile);
      return Promise.resolve(myDirectory);
    }
  }
  getPathLinkedDirectory() {
    let forgeFilePath = window.spinal.spinalSystem.getPath();
    let drivePath = this.cutLastElementOfPath(forgeFilePath);
    let linkedDirectoryPath = (drivePath =
      drivePath + '/ViewerLinkedDirectory');
    // console.log (linkedDirectoryPath);
    return linkedDirectoryPath;
  }

  loadDir(file) {
    return new Promise(async resolve => {
      file.load((dir) => {
        resolve(dir);
      })
    })
  }
  async getNbChildren(selectedNode) {
    const fileNode = await selectedNode.getChildren("hasFiles");
    return fileNode.length
  }
  async createDirectory(selectedNode) {
    let nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {

      let myDirectory = new Directory();

      let node = await selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.name.set("[Files]")
      node.info.type.set("SpinalFiles")
      return myDirectory;
    } else {
      return this.getDirectory(selectedNode)
    }
  }
  async createFile(directory, node) {
    let dir = await this.createDirectory(node);

    directory.add_file(node.info.name.get(), dir, {
      model_type: "Directory",
      icon: "folder",
      node: node
    })
    return dir;
  }
  async createFileDir(directory, name, childDirNode) {
    let childDir = await this.getDirectory(childDirNode)
    // console.log(childDir)
    directory.add_file(name, childDir, {
      model_type: "Directory",
      icon: "folder",
      node: childDirNode
    })
    return childDir;
  }
  async getDirectory(selectedNode) {
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren("hasFiles");
      if (fileNode.length == 0) {
        return undefined
      } else {
        let directory = await fileNode[0].getElement();
        return (directory)
      }
    }
  }

  async newTryRecursiveExport(node, directory, context) {
    let myDir = undefined;
    for (let i = 0; i < directory.length; i++) {
      const element = directory[i];
      if (node.info.name.get() === element.name.get()) {
        // eslint-disable-next-line no-await-in-loop
        myDir = await this.loadDir(element)
        break;
      }
    }
    if (myDir === undefined) {
      // check if directory exist for node
      let child = await node.getChildren("hasFiles");
      if (child.length != 0) {
        myDir = await this.createFileDir(directory, node.info.name.get(),
          node)
      } else {
        myDir = await this.createFile(directory, node)
      }
    }
    let result = await node.getChildrenInContext(context);
    let tabProm = []
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      // console.log(element)
      tabProm.push(this.newTryRecursiveExport(element, myDir, context))
    }
    Promise.all(tabProm);
  }

}
export const serviceDocumentation = new DocumentationService();
// /*
//  * Copyright 2020 SpinalCom - www.spinalcom.com
//  * 
//  * This file is part of SpinalCore.
//  * 
//  * Please read all of the following terms and conditions
//  * of the Free Software license Agreement ("Agreement")
//  * carefully.
//  * 
//  * This Agreement is a legally binding contract between
//  * the Licensee (as defined below) and SpinalCom that
//  * sets forth the terms and conditions that govern your
//  * use of the Program. By installing and/or using the
//  * Program, you agree to abide by all the terms and
//  * conditions stated or referenced herein.
//  * 
//  * If you do not agree to abide by these terms and
//  * conditions, do not demonstrate your acceptance and do
//  * not install or use the Program.
//  * You should have received a copy of the license along
//  * with this file. If not, see
//  * <http://resources.spinalcom.com/licenses.pdf>.
//  */

// const {
//   SpinalNode,
//   SPINAL_RELATION_PTR_LST_TYPE

// } = require('spinal-model-graph');


// const {
//   SpinalURL,
//   SpinalAttribute,
//   SpinalNote,
// } = require("spinal-models-documentation");
// var $q = require("q");

// const bimObjectService = require("spinal-env-viewer-plugin-bimobjectservice").default
// const {
//   groupService
// } = require("spinal-env-viewer-room-manager/services/service");

// // var spinalCore = require('spinalcore');
// const {
//   BUILDING_TYPE
// } = require("spinal-env-viewer-context-geographic-service/build/constants")


// const isShownType = [BUILDING_TYPE]
// const BUILDINGINFORMATIONCATNAME = "Spinal Building Information"
// const BUILDINGINFORMATION = ["Titre", "Bâtiment", "Surface", "Adresse", "Ville"]

// class DocumentationService {
//   removeNode(node) {
//     node.removeFromGraph();
//   }

//   ///////////////////////////////////////////////////////////////////////////////////
//   //      Spinal URL function                                                 //
//   ///////////////////////////////////////////////////////////////////////////////////
//   async addURL(parentNode, nameURL, URL) {
//     if (
//       nameURL != undefined &&
//       URL != undefined &&
//       URL != "" &&
//       nameURL != ""
//     ) {
//       let myChild = new SpinalURL(nameURL, URL);

//       if (parentNode instanceof SpinalNode) {
//         let node = await parentNode.addChild(
//           myChild,
//           "hasURL",
//           SPINAL_RELATION_PTR_LST_TYPE
//         );
//         node.info.name.set("[URL] " + nameURL);
//         node.info.type.set("SpinalURL");
//       } else {
//         console.log("bad request add url");
//       }
//     }
//   }

//   async getURL(parentNode) {
//     const urlNodes = await parentNode.getChildren("hasURL");
//     const urls = [];

//     for (let url of urlNodes) {
//       let element = url.getElement();
//       urls.push(
//         element.then((loadedURL) => {
//           return {
//             element: loadedURL,
//             node: url,
//           };
//         })
//       );
//     }
//     return Promise.all(urls);
//   }

//   getParents(selectedNode, relationNames) {
//     const promises = [];
//     if (selectedNode == undefined) {
//       return Promise.resolve([]);
//     }
//     if (typeof relationNames === "undefined" || relationNames.length === 0) {
//       relationNames = selectedNode.parents.keys();
//     }

//     for (let name of relationNames) {
//       const list = selectedNode.parents.getElement(name);
//       if (list != undefined) {
//         for (let i = 0; i < list.length; i++) {
//           promises.push(
//             list[i].load().then((relation) => {
//               return relation.getParent();
//             })
//           );
//         }
//       }
//     }
//     return Promise.all(promises);
//   }

//   async getParentGroup(selectedNode) {
//     return this.getParents(selectedNode, [
//       groupService.constants.GROUP_TO_ROOMS_RELATION,
//       groupService.constants.GROUP_TO_EQUIPMENTS_RELATION,
//     ]).then((res) => {
//       return res;
//     });
//   }

//   async deleteURL(parentNode, label) {
//     const urlNodes = await parentNode.getChildren("hasURL");
//     const urls = [];

//     for (let url of urlNodes) {
//       let element = url.getElement();
//       element.then((loadedURL) => {
//         if (loadedURL.label.get() == label) {
//           url.removeFromGraph();
//         }
//       });
//     }
//     return Promise.all(urls);
//   }

//   ///////////////////////////////////////////////////////////////////////////////////
//   //      Spinal attributes function                                                 //
//   ///////////////////////////////////////////////////////////////////////////////////

//   async addCategoryAttribute(parentNode, label) {
//     let bool = true;
//     if (parentNode instanceof SpinalNode) {
//       // cannot add category with same name
//       let category = await parentNode.getChildren("hasCategoryAttributes");
//       for (let i = 0; i < category.length; i++) {
//         const element = category[i];
//         if (element.info.name.get() == label) {
//           // do not create category
//           bool = false;
//         }
//       }
//       if (bool) {
//         let categoryNode = new SpinalNode(
//           label,
//           "categoryAttributes",
//           new Lst()
//         );
//         await parentNode.addChild(
//           categoryNode,
//           "hasCategoryAttributes",
//           SPINAL_RELATION_PTR_LST_TYPE
//         );
//         return this.getCategoryByName(parentNode, label);
//       } else {
//         return this.getCategoryByName(parentNode, label);
//       }
//     }
//   }

//   async getCategory(parentNode) {
//     const attrNodes = await parentNode.getChildren("hasCategoryAttributes");
//     const attrs = [];
//     for (let attr of attrNodes) {
//       let element = attr.getElement();
//       attrs.push(
//         element.then((loadedElement) => {
//           return {
//             element: loadedElement,
//             nameCat: attr.info.name.get(),
//             node: attr,
//           };
//         })
//       );
//     }
//     return Promise.all(attrs);
//   }

//   async getCategoryByName(parentNode, categoryName) {
//     let catArray = await this.getCategory(parentNode);
//     for (let i = 0; i < catArray.length; i++) {
//       const element = catArray[i];
//       if (element.node.info.name.get() == categoryName) {
//         return element;
//       }
//     }
//   }

//   async getAttributesByCategory(parentNode, categoryName) {
//     let cat = await this.getCategoryByName(parentNode, categoryName);
//     let tab = [];
//     for (let i = 0; i < cat.element.length; i++) {
//       const element = cat.element[i];
//       tab.push(element);
//     }
//     return tab;
//   }

//   async addAttributeByCategory(parentNode, category, label, value) {
//     let status = true;
//     if (
//       label != undefined &&
//       value != undefined &&
//       value != "" &&
//       label != ""
//     ) {
//       let allAttributes = await this.getAllAttributes(parentNode);
//       for (let i = 0; i < allAttributes.length; i++) {
//         const element = allAttributes[i];
//         if (element.label.get() == label) {
//           status = false;
//         }
//       }
//       if (status) {
//         if (category != undefined) {
//           let myChild = new SpinalAttribute(label, value);
//           category.element.push(myChild);
//         }
//       }
//     }
//   }

//   async addAttributeByCategoryName(parentNode, categoryName, label, value) {
//     const _this = this;
//     let status = true;
//     let categoryNode = undefined;
//     let cat = this.getCategoryByName(parentNode, categoryName);
//     if (
//       label != undefined &&
//       value != undefined &&
//       value != "" &&
//       label != ""
//     ) {
//       let allAttributes = await this.getAllAttributes(parentNode);
//       for (let i = 0; i < allAttributes.length; i++) {
//         const element = allAttributes[i];
//         if (element.label.get() == label) {
//           status = false;
//           return element;
//         }
//       }
//       if (status) {
//         cat.then(async function create(category) {
//           if (category == undefined) {
//             categoryNode = await _this.addCategoryAttribute(
//               parentNode,
//               categoryName
//             );
//             categoryNode.getElement().then((element) => {
//               let myChild = new SpinalAttribute(label, value);
//               element.push(myChild);
//             });
//           } else {
//             let myChild = new SpinalAttribute(label, value);
//             category.element.push(myChild);
//             // add attributes in category found
//           }
//         });
//       }
//     }
//   }

//   async addAttribute(parentNode, label, value) {
//     if (
//       label != undefined &&
//       value != undefined &&
//       value != "" &&
//       label != ""
//     ) {
//       let myChild = new SpinalAttribute(label, value);

//       if (parentNode instanceof SpinalNode) {
//         let node = await parentNode.addChild(
//           myChild,
//           "hasAttributes",
//           SPINAL_RELATION_PTR_LST_TYPE
//         );
//         node.info.name.set("[Attributes] " + label);
//         node.info.type.set("SpinalAttributes");
//       }
//     } else {
//       console.log("bad request add attributes");
//     }
//   }

//   async getAllAttributes(parentNode) {
//     let promisArray = [];
//     const categoryArray = await this.getCategory(parentNode);
//     let arrayAttributes = [];

//     for (let i = 0; i < categoryArray.length; i++) {
//       const element = categoryArray[i];
//       const tab = this.getAttributesByCategory(
//         parentNode,
//         element.node.info.name.get()
//       );
//       promisArray.push(
//         tab.then((res) => {
//           arrayAttributes.push(...res);
//         })
//       );
//     }
//     await Promise.all(promisArray);
//     return arrayAttributes;
//   }

//   async getAttributes(parentNode) {
//     // get hasCategoryAttributes and return list of all attributes
//     const attrNodes = await parentNode.getChildren("hasAttributes");
//     const attrs = [];
//     for (let attr of attrNodes) {
//       let element = attr.getElement();
//       attrs.push(
//         element.then((loadedElement) => {
//           return {
//             element: loadedElement,
//             node: attr,
//           };
//         })
//       );
//     }

//     return Promise.all(attrs);
//   }

//   compareAttr(listAttr1, listAttr2) {
//     let sharedAttributes = [];
//     for (let j = 0; j < listAttr1.length; j++) {
//       const element = listAttr1[j];
//       for (let k = 0; k < listAttr2.length; k++) {
//         const element2 = listAttr2[k];
//         if (element.label.get() == element2.label.get()) {
//           sharedAttributes.push(element);
//         }
//       }
//     }
//     return sharedAttributes;
//   }

//   async getAttributesShared(listOfdbId) {
//     let _this = this;
//     let listOfNode = [];
//     let sharedAttributes = [];
//     let attrToCompare = [];
//     for (let i = 0; i < listOfdbId.length; i++) {
//       const dbId = listOfdbId[i];
//       listOfNode.push(bimObjectService.getBIMObject(dbId));
//     }

//     return Promise.all(listOfNode).then(function(bimObjectNodes) {
//       // get category for the first BO
//       return _this.getAllAttributes(bimObjectNodes[0]).then((res) => {
//         attrToCompare = res;
//         let arrayOfProm = [];

//         for (let i = 1; i < bimObjectNodes.length; i++) {
//           const BIMObject = bimObjectNodes[i];

//           arrayOfProm.push(
//             _this.getAllAttributes(BIMObject).then((
//               attributesList) => {
//               attrToCompare = _this.compareAttr(attrToCompare,
//                 attributesList);
//               return attrToCompare;
//             })
//           );
//         }
//         // return
//         return Promise.all(arrayOfProm).then((arr) => {
//           return attrToCompare;
//         });
//       });
//     });
//   }

//   getBuildingInformationAttributes(parentNode) {
//     let lst = [];
//     let lstPromise = [];
//     if (isShownType.indexOf(parentNode.info.type.get()) != -1) {
//       for (let i = 0; i < BUILDINGINFORMATION.length; i++) {
//         const element = BUILDINGINFORMATION[i];
//         let promise = this.findAttributesByLabel(parentNode, element).then(
//           (attributesFind) => {
//             if (attributesFind != undefined) {
//               lst.push(attributesFind);
//             }
//           }
//         );
//         lstPromise.push(promise);
//       }
//       return Promise.all(lstPromise).then(() => {
//         return lst;
//       });
//     }
//   }

//   setBuildingInformationAttributes(parentNode) {
//     let promiseArray = [];
//     if (parentNode instanceof SpinalNode) {} else {
//       parentNode = SpinalGraphService.getRealNode(parentNode);
//     }
//     if (isShownType.indexOf(parentNode.info.type.get()) != -1) {
//       return this.addCategoryAttribute(
//         parentNode,
//         BUILDINGINFORMATIONCATNAME
//       ).then((category) => {
//         for (let i = 0; i < BUILDINGINFORMATION.length; i++) {
//           const element = BUILDINGINFORMATION[i];
//           let promise = this.addAttributeByCategoryName(
//             parentNode,
//             BUILDINGINFORMATIONCATNAME,
//             element,
//             "To configure"
//           );
//           promiseArray.push(promise);
//         }
//         return Promise.all(promiseArray).then(() => {
//           return this.getBuildingInformationAttributes(parentNode);
//         });
//       });
//     }
//   }

//   findAttributesByLabel(parentNode, label) {
//     // this.getCategoryByName
//     return this.getAllAttributes(parentNode).then((data) => {
//       for (let i = 0; i < data.length; i++) {
//         const element = data[i];
//         if (element.label.get() === label) {
//           return element;
//         }
//       }
//     });
//   }

//   removeAttributesByLabel(parentNode, label) {
//     console.log(parentNode);
//     console.log(label);
//     this.findAttributesByLabel(parentNode, label);
//   }

//   ///////////////////////////////////////////////////////////////////////////////////
//   //      SPinal notes function                                                    //
//   ///////////////////////////////////////////////////////////////////////////////////
//   async addNote(parentNode, username, note) {
//     if (parentNode instanceof SpinalNode) {
//       let mySpinalNote = new SpinalNote(username, note);
//       let node = await parentNode.addChild(
//         mySpinalNote,
//         "hasNotes",
//         SPINAL_RELATION_PTR_LST_TYPE
//       );
//       node.info.type.set("SpinalNote");
//     } else {
//       console.log("bad request add attributes");
//     }
//   }

//   async getNotes(parentNode) {
//     if (parentNode instanceof SpinalNode) {
//       const notesChildren = await parentNode.getChildren("hasNotes");
//       const notes = [];
//       for (let noteNode of notesChildren) {
//         let element = noteNode.getElement();
//         notes.push(
//           element.then((loadedElement) => {
//             return {
//               element: loadedElement,
//               selectedNode: noteNode,
//             };
//           })
//         );
//       }
//       return Promise.all(notes);
//     } else {
//       console.log("bad request add attributes");
//     }
//   }

//   editNote(element, note) {
//     let date = new Date();
//     element.message.set(note);
//     element.date.set(date);
//   }

//   predicate(node) {
//     return true;
//   }

//   ///////////////////////////////////////////////////////////////////////////////////
//   //      export to drive function                                                 //
//   ///////////////////////////////////////////////////////////////////////////////////
//   async exportToDrive(context) {
//     let driveDirectory = await this.getDriveDirectoryOfForgeFile();
//     // now we will create a related directory of graph
//     let ViewerDirectoryInDrive = await this.getDriveLinkedDirectory(
//       driveDirectory
//     );
//     let name = context.info.name.get();
//     let obj = {};
//     obj[name] = {
//       _info: {
//         relation: Object.keys(context.parents).pop(),
//       },
//     };
//     let path = this.getPathLinkedDirectory() + "/" + context.info.name.get();
//     let depth = 0;
//     let contextDirectory = await this.createDirectory(context);
//     ViewerDirectoryInDrive.add_file(context.info.name.get(),
//       contextDirectory, {
//         model_type: "Directory",
//         icon: "folder",
//         node: new Ptr(context),
//       });
//     this.startRecursiveExport(context, contextDirectory, context);
//   }

//   async startRecursiveExport(node, directory, context) {
//     let result = await node.getChildrenInContext(context);
//     for (let i = 0; i < result.length; i++) {
//       const element = result[i];
//       this.newTryRecursiveExport(element, directory, context);
//     }
//   }
//   cutLastElementOfPath(path) {
//     let pathTab = path.split("/");
//     let str = "";
//     for (let i = 1; i < pathTab.length - 1; i++) {
//       const element = pathTab[i];
//       str = str + "/" + element;
//     }
//     return str;
//   }
//   getDriveDirectoryOfForgeFile() {
//     let forgeFilePath = window.spinal.spinalSystem.getPath();
//     let drivePath = this.cutLastElementOfPath(forgeFilePath);
//     return window.spinal.spinalSystem.load(drivePath).then((directory) => {
//       return directory;
//     });
//   }
//   getDriveLinkedDirectory(directory) {
//     let myCheck = false;
//     let myFile = undefined;
//     for (let i = 0; i < directory.length; i++) {
//       const element = directory[i];
//       if (element.name.get() == "ViewerLinkedDirectory") {
//         myCheck = true;
//         myFile = element;
//       }
//     }
//     if (myCheck) {
//       return new Promise((resolve) => {
//         myFile._ptr.load((FileDirectory) => {
//           resolve(FileDirectory);
//         });
//       });
//     } else {
//       // il faut créer le directory
//       let myDirectory = new Directory();

//       let myFile = new File("ViewerLinkedDirectory", myDirectory);
//       directory.push(myFile);
//       return Promise.resolve(myDirectory);
//     }
//   }
//   getPathLinkedDirectory() {
//     let forgeFilePath = window.spinal.spinalSystem.getPath();
//     let drivePath = this.cutLastElementOfPath(forgeFilePath);
//     let linkedDirectoryPath = (drivePath =
//       drivePath + "/ViewerLinkedDirectory");
//     return linkedDirectoryPath;
//   }

//   loadDir(file) {
//     return new Promise(async (resolve) => {
//       file.load((dir) => {
//         resolve(dir);
//       });
//     });
//   }
//   async getNbChildren(selectedNode) {
//     const fileNode = await selectedNode.getChildren("hasFiles");
//     return fileNode.length;
//   }
//   async createDirectory(selectedNode) {
//     let nbNode = await this.getNbChildren(selectedNode);
//     if (nbNode == 0) {
//       let myDirectory = new Directory();

//       let node = await selectedNode.addChild(
//         myDirectory,
//         "hasFiles",
//         SPINAL_RELATION_PTR_LST_TYPE
//       );
//       node.info.name.set("[Files]");
//       node.info.type.set("SpinalFiles");
//       return myDirectory;
//     } else {
//       return this.getDirectory(selectedNode);
//     }
//   }
//   async createFile(directory, node) {
//     let dir = await this.createDirectory(node);

//     directory.add_file(node.info.name.get(), dir, {
//       model_type: "Directory",
//       icon: "folder",
//       node: new Ptr(node),
//     });
//     return dir;
//   }
//   async createFileDir(directory, name, childDirNode) {
//     let childDir = await this.getDirectory(childDirNode);
//     directory.add_file(name, childDir, {
//       model_type: "Directory",
//       icon: "folder",
//       node: new Ptr(childDirNode),
//     });
//     return childDir;
//   }
//   async getDirectory(selectedNode) {
//     if (selectedNode != undefined) {
//       const fileNode = await selectedNode.getChildren("hasFiles");
//       if (fileNode.length == 0) {
//         return undefined;
//       } else {
//         let directory = await fileNode[0].getElement();
//         return directory;
//       }
//     }
//   }

//   async newTryRecursiveExport(node, directory, context) {
//     let myDir = undefined;
//     for (let i = 0; i < directory.length; i++) {
//       const element = directory[i];
//       if (node.info.name.get() === element.name.get()) {
//         // eslint-disable-next-line no-await-in-loop
//         myDir = await this.loadDir(element);
//         break;
//       }
//     }
//     if (myDir === undefined) {
//       // check if directory exist for node
//       let child = await node.getChildren("hasFiles");
//       if (child.length != 0) {
//         myDir = await this.createFileDir(directory, node.info.name.get(),
//           node);
//       } else {
//         myDir = await this.createFile(directory, node);
//       }
//     }
//     let result = await node.getChildrenInContext(context);
//     let tabProm = [];
//     for (let i = 0; i < result.length; i++) {
//       const element = result[i];
//       tabProm.push(this.newTryRecursiveExport(element, myDir, context));
//     }
//     Promise.all(tabProm);
//   }
// }

// const serviceDocumentation = new DocumentationService();

// // export {
// //   serviceDocumentation
// // }

// exports.default = serviceDocumentation;

// module.exports = {
//   serviceDocumentation
// };

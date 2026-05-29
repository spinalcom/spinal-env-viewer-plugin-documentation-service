/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

console.warn("Warning: spinal-env-viewer-plugin-documentation is deprecated. Please use spinal-env-viewer-plugin-service-documentation instead.");

import { Directory } from "spinal-core-connectorjs_type";
import { serviceDocumentation } from "./Models/ServiceDocumentation";
import { FileVersion, SpinalDocument } from "./models_spinalcom";
import { File, Path } from "spinal-core-connectorjs";

export * from "./Models/constants";
export * from "./interfaces/index";
export * from "./Models/AttributeService";
export * from "./Models/FileExplorer";
export * from "./Models/NoteService";
export * from "./Models/UrlService";
export * from "./Models/ServiceDocumentation";
export * from "./models_spinalcom";

export default serviceDocumentation;

// const spinalDocument = new SpinalDocument(
// 	"test",
// 	new FileVersion({
// 		version: 1,
// 		hashes: [
// 			{
// 				index: 0,
// 				path: new Path(Buffer.from("test"), "text/plain"),
// 				size: 4,
// 				hash: "098f6bcd4621373cade4e832627b4f6",
// 			},
// 		],
// 	}),
// 	{ model_type: "directory" },
// );
// console.log("spinalDocument", spinalDocument instanceof File);

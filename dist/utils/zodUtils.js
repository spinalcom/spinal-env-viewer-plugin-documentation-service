"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateICategory = exports.validateSpinalNode = exports.validateSpinalNodeOfType = exports.transformStringOrNumber = exports.validateStringOptional = exports.validateStringCoerce = exports.validateStringEmpty = exports.validateString = void 0;
const zod_1 = require("zod");
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
/**
 * validates and trims non-empty strings
 */
exports.validateString = zod_1.z.string().trim().min(1);
/**
 * validates and trims strings that can be empty
 */
exports.validateStringEmpty = zod_1.z.string().trim();
/**
 * validates and trims strings that can be empty
 */
exports.validateStringCoerce = zod_1.z.coerce.string().trim();
/**
 * validates and trims non-empty strings or allows undefined
 */
exports.validateStringOptional = zod_1.z.string().trim().min(1).optional();
/**
 * converts string numbers to number, keeps numbers as-is, and keeps non-numeric strings as strings
 */
exports.transformStringOrNumber = zod_1.z
    .union([zod_1.z.number(), zod_1.z.string()])
    .transform((val) => {
    if (typeof val === 'number')
        return val;
    const num = Number(val);
    return isNaN(num) ? val : num;
});
/**
 * validates that the input is a SpinalNode of a specific type
 */
const validateSpinalNodeOfType = (type) => zod_1.z.instanceof(spinal_model_graph_1.SpinalNode).refine((node) => node.info.type.get() === type, {
    error: `Expected SpinalNode of type ${type}`,
});
exports.validateSpinalNodeOfType = validateSpinalNodeOfType;
exports.validateSpinalNode = zod_1.z.instanceof(spinal_model_graph_1.SpinalNode);
exports.validateICategory = zod_1.z.object({
    nameCat: exports.validateString,
    node: exports.validateSpinalNode,
    element: zod_1.z.instanceof((spinal_core_connectorjs_1.Lst)), // Adjust this as needed based on the actual type of spinal.Lst
});
//# sourceMappingURL=zodUtils.js.map
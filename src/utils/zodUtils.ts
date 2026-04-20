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

import { z } from 'zod';
import { SpinalNode } from 'spinal-model-graph';
import { Lst } from 'spinal-core-connectorjs';
import type { SpinalAttribute } from 'spinal-models-documentation';

/**
 * validates and trims non-empty strings
 */
export const validateString = z.string().trim().min(1);

/**
 * validates and trims strings that can be empty
 */
export const validateStringEmpty = z.string().trim();

/**
 * validates and trims strings that can be empty
 */
export const validateStringCoerce = z.coerce.string().trim();

/**
 * validates and trims non-empty strings or allows undefined
 */
export const validateStringOptional = z.string().trim().min(1).optional();

/**
 * converts string numbers to number, keeps numbers as-is, and keeps non-numeric strings as strings
 */
export const transformStringOrNumber = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (typeof val === 'number') return val;
    const num = Number(val);
    return isNaN(num) ? val : num;
  });

/**
 * validates that the input is a SpinalNode of a specific type
 */
export const validateSpinalNodeOfType = (type: string) =>
  z.instanceof(SpinalNode).refine((node) => node.info.type.get() === type, {
    error: `Expected SpinalNode of type ${type}`,
  });

export const validateSpinalNode = z.instanceof(SpinalNode);

export const validateICategory = z.object({
  nameCat: validateString,
  node: validateSpinalNode,
  element: z.instanceof(Lst<SpinalAttribute>), // Adjust this as needed based on the actual type of spinal.Lst
});

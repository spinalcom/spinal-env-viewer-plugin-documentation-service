import { z } from 'zod';
import { SpinalNode } from 'spinal-model-graph';
import { Lst } from 'spinal-core-connectorjs';
import type { SpinalAttribute } from 'spinal-models-documentation';
/**
 * validates and trims non-empty strings
 */
export declare const validateString: z.ZodString;
/**
 * validates and trims strings that can be empty
 */
export declare const validateStringEmpty: z.ZodString;
/**
 * validates and trims strings that can be empty
 */
export declare const validateStringCoerce: z.ZodCoercedString<unknown>;
/**
 * validates and trims non-empty strings or allows undefined
 */
export declare const validateStringOptional: z.ZodOptional<z.ZodString>;
/**
 * converts string numbers to number, keeps numbers as-is, and keeps non-numeric strings as strings
 */
export declare const transformStringOrNumber: z.ZodPipe<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>, z.ZodTransform<string | number, string | number>>;
/**
 * validates that the input is a SpinalNode of a specific type
 */
export declare const validateSpinalNodeOfType: (type: string) => z.ZodCustom<SpinalNode<import("spinal-core-connectorjs").Model>, SpinalNode<import("spinal-core-connectorjs").Model>>;
export declare const validateSpinalNode: z.ZodCustom<SpinalNode<import("spinal-core-connectorjs").Model>, SpinalNode<import("spinal-core-connectorjs").Model>>;
export declare const validateICategory: z.ZodObject<{
    nameCat: z.ZodString;
    node: z.ZodCustom<SpinalNode<import("spinal-core-connectorjs").Model>, SpinalNode<import("spinal-core-connectorjs").Model>>;
    element: z.ZodCustom<Lst<SpinalAttribute>, Lst<SpinalAttribute>>;
}, z.core.$strip>;

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

import type { IUrl } from '../interfaces';
import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from 'spinal-model-graph';
import { SpinalURL } from 'spinal-models-documentation';
import {
  validateSpinalNode,
  validateString,
  validateStringOptional,
} from '../utils/zodUtils';
import { URL_RELATION, URL_TYPE } from './constants';

class UrlService {
  constructor() {}

  /**
   * @param {SpinalNode} node
   * @param {string} urlName
   * @param {string} urlLink
   * @return {*}  {Promise<IUrl>}
   * @memberof UrlService
   */
  public async addURL(
    node: SpinalNode,
    urlName: string,
    urlLink: string
  ): Promise<IUrl> {
    urlName = validateString.parse(urlName);
    urlLink = validateString.parse(urlLink);
    node = validateSpinalNode.parse(node);
    const urlExist = await this.getURL(node, urlName);

    if (urlExist)
      throw new Error(`${urlName} already exist in ${node.getName().get()}`);

    const urlModel = new SpinalURL(urlName, urlLink);
    const urlNode = new SpinalNode(`[URL] ${urlName}`, URL_TYPE, urlModel);
    await node.addChild(urlNode, URL_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    return this._getUrlData(urlNode);
  }

  /**
   * @param {SpinalNode} node
   * @param {string} urlName
   * @return {*}  {(Promise<IUrl | undefined>)}
   * @memberof UrlService
   */
  public async getURL(
    node: SpinalNode,
    urlName: string
  ): Promise<IUrl | undefined>;
  /**
   * @param {SpinalNode} node
   * @param {string} urlName
   * @return {*}  {Promise<IUrl | undefined | IUrl[]>}
   * @memberof UrlService
   */
  public async getURL(node: SpinalNode): Promise<IUrl[]>;
  public async getURL(
    node: SpinalNode,
    urlName?: string
  ): Promise<IUrl | undefined | IUrl[]> {
    urlName = validateStringOptional.parse(urlName);
    const urlNodes = await node.getChildren(URL_RELATION);
    const promises = [];

    for (const urlNode of urlNodes) {
      promises.push(this._getUrlData(urlNode));
    }

    const values = await Promise.all(promises);
    if (urlName) {
      return values.find(({ element }) => {
        const elementName = element.name.get();
        return elementName.toString().trim() === urlName;
      });
    }
    return values;
  }

  /**
   * @param {SpinalNode} argNode
   * @param {string} label
   * @param {string} newValue
   * @return {*}  {Promise<IUrl>}
   * @memberof UrlService
   */
  public async updateUrl(
    argNode: SpinalNode,
    label: string,
    newValue: string
  ): Promise<IUrl | undefined> {
    newValue = validateString.parse(newValue);
    let url = await this.getURL(argNode, label);

    if (url) {
      const { node, element } = url;

      if (node && element) {
        const elementUrl = element.URL.get();
        if (elementUrl.toString().trim() !== newValue)
          element.URL.set(newValue);
      }
      return url;
    }
  }

  /**
   * @param {SpinalNode} node
   * @param {Array<string>} url_relationNames
   * @return {*}  {Promise<SpinalNode[]>}
   * @memberof UrlService
   * @deprecated
   */
  public getParents(
    node: SpinalNode,
    url_relationNames: Array<string>
  ): Promise<SpinalNode[]> {
    return node.getParents(url_relationNames);
  }

  /**
   * @param {SpinalNode} node
   * @return {*}  {Promise<SpinalNode[]>}
   * @memberof UrlService
   * @deprecated
   */
  public getParentGroup(node: SpinalNode): Promise<SpinalNode[]> {
    return this.getParents(node, []);
  }

  /**
   * @param {SpinalNode} node
   * @param {string} label
   * @return {*}  {Promise<void>}
   * @memberof UrlService
   */
  public async deleteURL(node: SpinalNode, label: string): Promise<void> {
    label = validateString.parse(label);
    const url = await this.getURL(node, label);

    if (url && url.node) {
      return url.node.removeFromGraph();
    }
  }

  /**
   * @param {SpinalNode} node
   * @return {*}  {Promise<{ node: SpinalNode; urls: SpinalURL[] }[]>}
   * @memberof UrlService
   */
  public async getSharedUrls(
    node: SpinalNode
  ): Promise<{ node: SpinalNode; urls: SpinalURL[] }[]> {
    const parents = await node.getParents();
    const promises = parents.map(async (parent) => {
      const _urls = await this.getURL(parent);
      return {
        node: parent,
        urls: _urls.map((el) => el.element),
      };
    });

    return Promise.all(promises);
  }

  //////////////////////////////////////////////////////////////////////////////////
  //                                     PRIVATES                                 //
  //////////////////////////////////////////////////////////////////////////////////

  /**
   * @param {*} urlNode
   * @param {string} [urlName]
   * @return {*}  {Promise<IUrl>}
   * @memberof UrlService
   */
  public async _getUrlData(urlNode: any): Promise<IUrl> {
    const element = await urlNode.getElement();
    return {
      element: element,
      node: urlNode,
    };
  }
}

const urlService = new UrlService();

export { UrlService, urlService };
export default UrlService;

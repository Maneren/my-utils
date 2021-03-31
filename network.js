import { request } from 'request-promise-native';
import A from './array.js';
const { last } = A;

class Network {
  /**
   * makes request to specific url via proxy
   * (uses request-promise-native)
   * @param {string} url target url
   * @param {object} options request options
   * @param {string} proxy url of proxy
   * @returns {Promise<string>} Promise with result of request
   */
  static async requestWithProxy (url, options, proxy) {
    return await request(`${proxy}/${url}`, { ...options });
  }

  /**
   * splits url into prefix, domain, page and parameters
   * @param {string} url
   * @returns {{ prefix: string, domain: string, page: string, parameters: {string, string} }} parsed url
   */
  static decodeURL (url) {
    if (typeof url === 'string') {
      let prefix;
      if (url[5] === ':') prefix = 'https://';
      else prefix = 'http://';

      url = url.substr(prefix.length);
      const [domain, ...target] = url.split('/');
      const [page, params] = last(target).split('?');

      const parameters = {};
      params.split('&').forEach(param => {
        const [key, value] = param.split('=');
        parameters[key] = value;
      });

      return {
        prefix,
        domain,
        page,
        parameters
      };
    }
  }
}

export default Network;

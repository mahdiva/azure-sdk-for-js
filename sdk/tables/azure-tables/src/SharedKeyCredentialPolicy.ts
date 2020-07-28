// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  RequestPolicy,
  RequestPolicyOptions,
  WebResource,
  BaseRequestPolicy,
  HttpOperationResponse
} from "@azure/core-http";
import { SharedKeyCredential } from "./SharedKeyCredential";
import { HeaderConstants } from "./utils/constants";
import { URL } from "./utils/url";

/**
 * SharedKeyCredentialPolicy is a policy used to sign HTTP request with a shared key.
 *
 * @export
 * @class SharedKeyCredentialPolicy
 * @extends {CredentialPolicy}
 */
export class SharedKeyCredentialPolicy extends BaseRequestPolicy {
  /**
   * Reference to {@link SharedKeyCredential} which generates SharedKeyCredentialPolicy
   *
   * @type {SharedKeyCredential}
   * @memberof SharedKeyCredentialPolicy
   */
  private readonly factory: SharedKeyCredential;

  /**
   * Creates an instance of SharedKeyCredentialPolicy.
   * @param {RequestPolicy} nextPolicy
   * @param {RequestPolicyOptions} options
   * @param {SharedKeyCredential} factory
   * @memberof SharedKeyCredentialPolicy
   */
  constructor(
    nextPolicy: RequestPolicy,
    options: RequestPolicyOptions,
    factory: SharedKeyCredential
  ) {
    super(nextPolicy, options);
    this.factory = factory;
  }

  /**
   * Sends out request.
   *
   * @param {WebResource} request
   * @returns {Promise<HttpOperationResponse>}
   * @memberof CredentialPolicy
   */
  public sendRequest(request: WebResource): Promise<HttpOperationResponse> {
    return this._nextPolicy.sendRequest(this.signRequest(request));
  }

  /**
   * Signs request.
   *
   * @protected
   * @param {WebResource} request
   * @returns {WebResource}
   * @memberof SharedKeyCredentialPolicy
   */
  protected signRequest(request: WebResource): WebResource {
    request.headers.set(HeaderConstants.X_MS_DATE, new Date().toUTCString());

    if (request.body && typeof request.body === "string" && request.body.length > 0) {
      request.headers.set(HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(request.body));
    }

    // If x-ms-date is present, use it otherwise date
    const dateHeader =
      this.getHeaderValueToSign(request, `${HeaderConstants.X_MS_DATE}`) ||
      this.getHeaderValueToSign(request, HeaderConstants.DATE);

    if (!dateHeader) {
      throw new Error("Failed to sign request: x-ms-date or date header must be present");
    }

    const stringToSign: string =
      [
        request.method.toUpperCase(),
        this.getHeaderValueToSign(request, HeaderConstants.CONTENT_MD5),
        this.getHeaderValueToSign(request, HeaderConstants.CONTENT_TYPE),
        dateHeader
      ].join("\n") +
      "\n" +
      this.getCanonicalizedResourceString(request);

    const signature: string = this.factory.computeHMACSHA256(stringToSign);
    request.headers.set(
      HeaderConstants.AUTHORIZATION,
      `SharedKey ${this.factory.accountName}:${signature}`
    );
    return request;
  }

  /**
   * Retrieve header value according to shared key sign rules.
   * @see https://docs.microsoft.com/en-us/rest/api/services/authenticate-with-shared-key
   *
   * @private
   * @param {WebResource} request
   * @param {string} headerName
   * @returns {string}
   * @memberof SharedKeyCredentialPolicy
   */
  private getHeaderValueToSign(request: WebResource, headerName: string): string {
    const value = request.headers.get(headerName);

    if (!value) {
      return "";
    }
    return value;
  }

  /**
   * Retrieves the webResource canonicalized resource string.
   *
   * @private
   * @param {WebResource} request
   * @returns {string}
   * @memberof SharedKeyCredentialPolicy
   */
  private getCanonicalizedResourceString(request: WebResource): string {
    const url = new URL(request.url);
    const path = url.pathname || "/";

    let canonicalizedResourceString: string = "";
    canonicalizedResourceString += `/${this.factory.accountName}${path}`;

    const queries = url.searchParams;
    const lowercaseQueries: { [key: string]: string } = {};
    if (queries) {
      const queryKeys: string[] = [];
      for (const key in queries) {
        if (queries.hasOwnProperty(key)) {
          const lowercaseKey = key.toLowerCase();
          lowercaseQueries[lowercaseKey] = queries.get(key) || "";
          queryKeys.push(lowercaseKey);
        }
      }

      queryKeys.sort();

      for (const key of queryKeys) {
        canonicalizedResourceString += `\n${key}:${decodeURIComponent(lowercaseQueries[key])}`;
      }
    }

    return canonicalizedResourceString;
  }
}

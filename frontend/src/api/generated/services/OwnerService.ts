/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handler_Response } from '../models/handler_Response';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OwnerService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * 获取站长公开信息
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getOwner(): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/owner',
    });
  }
}

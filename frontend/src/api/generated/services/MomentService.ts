/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handler_Response } from '../models/handler_Response';
import type { request_CreateMomentRequest } from '../models/request_CreateMomentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MomentService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * 获取说说列表
   * @param page 页码
   * @param pageSize 每页数量
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getMoments(
    page: number = 1,
    pageSize: number = 5,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/moments',
      query: {
        'page': page,
        'pageSize': pageSize,
      },
    });
  }
  /**
   * 创建说说
   * @param request 说说数据
   * @returns handler_Response Created
   * @throws ApiError
   */
  public postMoments(
    request: request_CreateMomentRequest,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/moments',
      body: request,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
      },
    });
  }
  /**
   * 根据 ID 获取说说
   * @param id 说说ID
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getMoments1(
    id: number,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/moments/{id}',
      path: {
        'id': id,
      },
      errors: {
        404: `Not Found`,
      },
    });
  }
  /**
   * 删除说说
   * @param id 说说ID
   * @returns void
   * @throws ApiError
   */
  public deleteMoments(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/moments/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        404: `Not Found`,
      },
    });
  }
}

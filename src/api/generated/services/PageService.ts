/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handler_Response } from '../models/handler_Response';
import type { request_CreatePageRequest } from '../models/request_CreatePageRequest';
import type { request_UpdatePageRequest } from '../models/request_UpdatePageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PageService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * 获取页面列表
   * @param page 页码
   * @param pageSize 每页数量
   * @param status 按状态筛选
   * @param template 按模板筛选
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getPages(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    template?: string,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/pages',
      query: {
        'page': page,
        'pageSize': pageSize,
        'status': status,
        'template': template,
      },
    });
  }
  /**
   * 创建页面
   * @param request 页面数据
   * @returns handler_Response Created
   * @throws ApiError
   */
  public postPages(
    request: request_CreatePageRequest,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/pages',
      body: request,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
      },
    });
  }
  /**
   * 获取导航页面列表
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getPagesNav(): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/pages/nav',
    });
  }
  /**
   * 根据 Slug 获取页面
   * @param slug 页面 Slug
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getPagesSlug(
    slug: string,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/pages/slug/{slug}',
      path: {
        'slug': slug,
      },
      errors: {
        404: `Not Found`,
      },
    });
  }
  /**
   * 根据 ID 获取页面
   * @param id 页面ID
   * @returns handler_Response OK
   * @throws ApiError
   */
  public getPages1(
    id: number,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/pages/{id}',
      path: {
        'id': id,
      },
      errors: {
        404: `Not Found`,
      },
    });
  }
  /**
   * 更新页面
   * @param id 页面ID
   * @param request 页面数据
   * @returns handler_Response OK
   * @throws ApiError
   */
  public putPages(
    id: number,
    request: request_UpdatePageRequest,
  ): CancelablePromise<handler_Response> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/pages/{id}',
      path: {
        'id': id,
      },
      body: request,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        404: `Not Found`,
      },
    });
  }
  /**
   * 删除页面
   * @param id 页面ID
   * @returns void
   * @throws ApiError
   */
  public deletePages(
    id: number,
  ): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/pages/{id}',
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

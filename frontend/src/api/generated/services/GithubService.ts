/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { service_ContributionsResponse } from '../models/service_ContributionsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GithubService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * 获取 GitHub 贡献日历
   * @returns service_ContributionsResponse OK
   * @throws ApiError
   */
  public getGithubContributions(): CancelablePromise<service_ContributionsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/github/contributions',
      errors: {
        400: `Bad Request`,
        500: `Internal Server Error`,
      },
    });
  }
}

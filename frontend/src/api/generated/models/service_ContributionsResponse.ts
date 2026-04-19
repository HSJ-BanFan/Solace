/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { service_ContributionsGroup } from './service_ContributionsGroup';
export type service_ContributionsResponse = {
  /**
   * 按年份分组
   */
  groups?: Array<service_ContributionsGroup>;
  /**
   * 过去一年总贡献数
   */
  total?: number;
};


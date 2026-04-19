/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type request_UpdatePageRequest = {
  content?: string;
  cover_image?: string;
  order?: number;
  show_in_nav?: boolean;
  slug?: string;
  status?: request_UpdatePageRequest.status;
  summary?: string;
  template?: request_UpdatePageRequest.template;
  title?: string;
  version: number;
};
export namespace request_UpdatePageRequest {
  export enum status {
    DRAFT = 'draft',
    PUBLISHED = 'published',
  }
  export enum template {
    DEFAULT = 'default',
    ABOUT = 'about',
    PROJECTS = 'projects',
    FOOTPRINTS = 'footprints',
  }
}


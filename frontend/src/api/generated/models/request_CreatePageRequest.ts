/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type request_CreatePageRequest = {
  content?: string;
  cover_image?: string;
  order?: number;
  show_in_nav?: boolean;
  slug?: string;
  status?: request_CreatePageRequest.status;
  summary?: string;
  template?: request_CreatePageRequest.template;
  title: string;
};
export namespace request_CreatePageRequest {
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


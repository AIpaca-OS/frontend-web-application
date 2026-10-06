import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface DelaysResponse extends BaseResponse {

  delays: DelayResource[];

}

export interface DelayResource extends BaseResource {

  id: number;
  cause: string;
  priority: string;
  magnitude: string;
  studentIds: number[];
  createdAt: string;
}

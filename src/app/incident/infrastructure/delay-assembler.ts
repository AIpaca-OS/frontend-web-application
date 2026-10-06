import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Delay } from '../domain/model/delay.entity';
import { DelayResource, DelaysResponse } from './delays-response';

export class DelayAssembler implements BaseAssembler<Delay, DelayResource, DelaysResponse>{

  toEntitiesFromResponse(response: DelaysResponse): Delay[] {
    return response.delays.map((delay => this.toEntityFromResource(delay)));
  }

  toEntityFromResource(resource: DelayResource): Delay {
    return new Delay({
      id: resource.id,
      cause: resource.cause,
      priority: resource.priority,
      magnitude: resource.magnitude,
      studentIds: resource.studentsId,
      createdAt: resource.createdAt
    });
  }

  toResourceFromEntity(entity: Delay): DelayResource {
    return {
      id: entity.id,
      cause: entity.cause,
      priority: entity.priority,
      magnitude: entity.magnitude,
      studentIds: entity.studentsId,
      createdAt: entity.createdAt
    };
  }


}

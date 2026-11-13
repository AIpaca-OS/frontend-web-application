import { BaseEntity } from '../../../shared/domain/model/base-entity';
export interface TripPassenger {studentId:string;stopId:string;stopPosition:number;stopAddress:string;absent:boolean;stopServed:boolean;arrived:boolean;}
export class Trip implements BaseEntity {
  constructor(public id:number, public routeId:number, public driverProfileId:number,
    public vehicleId:number, public serviceDate:string, public shift:string,
    public status:string, public students:TripPassenger[]) {}
}

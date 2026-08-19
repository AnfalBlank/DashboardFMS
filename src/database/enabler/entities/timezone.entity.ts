import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('timezone')
export class EnablerTimezone {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'time_zone' })
  time_zone: string;
}

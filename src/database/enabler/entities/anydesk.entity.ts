import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('anydesk')
export class EnablerAnydesk {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'anydesk_id' })
  anydesk_id: string;
}

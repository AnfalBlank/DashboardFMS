import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('list_device')
export class EnablerListDevice {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'name' })
  name: string;

  @Column('text', { name: 'type' })
  type: string;
}

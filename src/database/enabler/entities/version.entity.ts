import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('version')
export class EnablerVersion {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'version' })
  version: string;

  @Column('text', { name: 'new_version' })
  new_version: string;

  @Column({ name: 'update_flag' })
  update_flag: number;

  @Column('datetime', { name: 'update_time' })
  update_time: Date;

  @Column({ name: 'update_order' })
  update_order: number;

  @Column({ name: 'progress' })
  progress: number;
}

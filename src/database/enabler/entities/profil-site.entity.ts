import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('profil_site')
export class EnablerProfilSite {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'id_site' })
  id_site: string;

  @Column('text', { name: 'tid' })
  tid: string;

  @Column('text', { name: 'mid' })
  mid: string;

  @Column('text', { name: 'id_company' })
  id_company: string;

  @Column('text', { name: 'id_controller' })
  id_controller: string;
}

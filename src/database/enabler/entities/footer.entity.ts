import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('footer')
export class EnablerFooter {
  @PrimaryColumn({ name: 'id_footer' })
  id_footer: number;

  @Column('text', { name: 'text_footer' })
  text_footer: string;
}

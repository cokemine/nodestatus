import { Table, Column, Model, Unique, Default } from 'sequelize-typescript';
import { hashSync } from 'bcryptjs';

@Table({
  underscored: true
})
export default class Server extends Model {
  @Unique
  @Column
  username!: string

  @Column
  get password(): string {
    return this.getDataValue('password');
  }

  set password(password: string) {
    this.setDataValue('password', hashSync(password));
  }

  @Column
  name!: string;

  @Column
  type!: string;

  @Column
  location!: string;

  @Column
  region!: string;

  @Default(false)
  @Column
  disabled!: boolean;
}

import { Table, Column, Model, Unique, Default, NotEmpty } from 'sequelize-typescript';
import { hashSync } from 'bcryptjs';

@Table({
  underscored: true
})
export class Server extends Model {
  @NotEmpty
  @Unique
  @Column
  username!: string;

  @NotEmpty
  @Column
  get password(): string {
    return this.getDataValue('password');
  }

  set password(password: string) {
    this.setDataValue('password', hashSync(password));
  }

  @NotEmpty
  @Column
  name!: string;

  @NotEmpty
  @Column
  type!: string;

  @NotEmpty
  @Column
  location!: string;

  @NotEmpty
  @Column
  region!: string;

  @NotEmpty
  @Default(false)
  @Column
  disabled!: boolean;
}

@Table({
  underscored: true
})
export class Order extends Model {
  /* varchar id split by ',' */
  @NotEmpty
  @Unique
  @Column
  order!: string;
}

/* Deprecated */
@Table({
  underscored: true
})
export class User extends Model {
  @Unique
  @Column
  username!: string;

  @Column
  get password(): string {
    return this.getDataValue('password');
  }

  set password(password: string) {
    this.setDataValue('password', hashSync(password));
  }
}

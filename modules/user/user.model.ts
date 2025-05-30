import bcryptjs from 'bcryptjs';
import config from '../../src/config';
import { TUser } from './user.interface';
import { USER_Role, USER_STATUS } from './user.constants';
import KnexConnection from '../../src/database/implementations/knex/KnexConnection';

const knexConnection = new KnexConnection();

const ensureConnected = async () => {
  if (!knexConnection.isConnected()) {
    await knexConnection.connect();
  }
};

export const User = {
  async create(user: TUser): Promise<Omit<TUser, 'password'>> {
    await ensureConnected();
    const knex = knexConnection.getClient();

    if (!Object.keys(USER_Role).includes(user.role)) {
      throw new Error('Invalid role');
    }

    if (!Object.keys(USER_STATUS).includes(user.status || USER_STATUS.ACTIVE)) {
      throw new Error('Invalid status');
    }

    const hashedPassword = await bcryptjs.hash(user.password, Number(config.salt_round));

    const [createdUser] = await knex('users')
      .insert({
        name: user.name,
        role: user.role,
        email: user.email,
        password: hashedPassword,
        status: user.status || USER_STATUS.ACTIVE,
        passwordChangedAt: user.passwordChangedAt || null,
      })
      .returning(['id', 'name', 'email', 'role', 'status', 'passwordChangedAt']);

    return createdUser;
  },

  async findByEmail(email: string): Promise<TUser | null> {
    await ensureConnected();
    const knex = knexConnection.getClient();
    const user = await knex('users').where({ email }).first();
    return user || null;
  },

  async findById(id: number): Promise<TUser | null> {
    await ensureConnected();
    const knex = knexConnection.getClient();
    const user = await knex('users').where({ id }).first();
    return user || null;
  },

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await ensureConnected();
    const knex = knexConnection.getClient();
    const hashedPassword = await bcryptjs.hash(newPassword, Number(config.salt_round));
    await knex('users')
      .where({ id })
      .update({
        password: hashedPassword,
        passwordChangedAt: new Date(),
      });
  }
};

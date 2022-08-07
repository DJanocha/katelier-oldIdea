import { connectDB, clearDB, closeDB } from 'src/tests/db';
import {
  loginAs,
  PasswordVariant,
  propertiesBlockedFromBeingModified,
  register,
  registerArtist,
  updateUserData,
  updateUserPassword,
  UpdateUserPasswordInput
} from 'src/services/authService';
import { countUsers, getUserByEmail } from 'src/services/userService';
import { sample } from 'src/utils';

const userDataToUpdate = {
  name: 'fsdfsdlfksj',
  tel: 'sdf89sdf',
  email: 'newtestemail@ffdfd.com',
  ig: 's98fsefsef8e',
  facebook: 's8dfusd8ofk',
  image: 'sfdfso8fjs8effse',
  role: 'sdfskdfjsdlfksdf'
};
const getUserDataToUpdate = () => ({ ...userDataToUpdate });
beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('register', () => {
  let usersCountBefore: number;
  beforeEach(async () => {
    await register({ email: sample.email.taken, password: sample.pass.valid, passwordConfirm: sample.pass.valid });
    await registerArtist({
      email: sample.email.artist,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    usersCountBefore = await countUsers();
  });
  afterEach(async () => await clearDB());

  describe('when artist already registered', () => {
    it('Does not let register another artist', async () => {
      await expect(
        registerArtist({ email: sample.email.artist2, password: sample.pass.valid, passwordConfirm: sample.pass.valid })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });

  describe('given not matching passwords ', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: sample.email.client, password: sample.pass.valid, passwordConfirm: sample.pass.tooShort })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given too short passwords', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: sample.email.client, password: sample.pass.tooShort, passwordConfirm: sample.pass.tooShort })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given invalid email ', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: sample.email.invalid, password: sample.pass.tooShort, passwordConfirm: sample.pass.tooShort })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given already taken email', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: sample.email.taken, password: sample.pass.valid, passwordConfirm: sample.pass.valid })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given correct input', () => {
    it('Accepts user registration ', async () => {
      await expect(
        register({ email: sample.email.client, password: sample.pass.valid, passwordConfirm: sample.pass.valid })
      ).resolves.not.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore + 1);
    });
  });
});

describe('login', () => {
  beforeEach(async () => {
    await register({ email: sample.email.client, password: sample.pass.valid, passwordConfirm: sample.pass.valid });
  });
  it('Does not let you login with incorrect email or password', async () => {
    await expect(loginAs({ email: sample.email.invalid, password: sample.pass.valid })).rejects.toThrow();
    await expect(loginAs({ email: sample.email.client, password: sample.pass.invalid })).rejects.toThrow();
  });

  it('lets you log in when email and password are matching', async () => {
    await expect(loginAs({ email: sample.email.client, password: sample.pass.valid })).resolves.not.toThrow();
  });
});

describe('update password', () => {
  const getAndMutateDataForUpdatingUser = (extendedProps: PasswordVariant[] = []) => {
    const data: Record<string, string> = {
      email: sample.email.client,
      currentPassword: sample.pass.invalid,
      newPassword: sample.pass.valid,
      newPasswordConfirm: sample.pass.valid
    };
    extendedProps.forEach((extProp) => {
      data[extProp] = data[extProp] + ' extended';
    });
    return data as unknown as UpdateUserPasswordInput;
  };
  describe('given incorrect current password ', () => {
    it('Does not let you update password ', async () => {
      await expect(updateUserPassword(getAndMutateDataForUpdatingUser())).rejects.toThrow();
    });
  });
  describe('given new password and new password confirm not matching', () => {
    it('Does not let you update password ', async () => {
      await expect(updateUserPassword(getAndMutateDataForUpdatingUser(['newPasswordConfirm']))).rejects.toThrow();
    });
  });
  describe('given new passwords and new password confirm matching and valid current password', () => {
    it('lets you update password ', async () => {
      await expect(
        updateUserPassword(getAndMutateDataForUpdatingUser(['newPasswordConfirm', 'newPassword']))
      ).rejects.toThrow();
    });
  });
});
describe('update me', () => {
  beforeEach(async () => {
    await register({ email: sample.email.client, password: sample.pass.valid, passwordConfirm: sample.pass.valid });
  });
  it('Should not let to update password in update me route', async () => {
    await expect(getUserByEmail({email: sample.email.client })).resolves.not.toThrow();
    const dataVariants: Record<string, string>[] = [
      { newPassword: sample.pass.valid },
      { newPasswordConfirm: sample.pass.valid },
      {
        newPassword: sample.pass.valid,
        newPasswordConfirm: sample.pass.valid
      }
    ];
    await Promise.all(
      dataVariants.map(async (data) => {
        await expect(updateUserData({ email: sample.email.client, data })).rejects.toThrow();
      })
    );
  });
  it('Should let to update non-password values in update me route', async () => {
    const data = getUserDataToUpdate();
    await expect(updateUserData({ email: sample.email.client, data })).resolves.not.toThrow();
  });
  it('Should update every allowed property', async () => {
    const data = getUserDataToUpdate() as Record<string, any>;
    const updatedUser = (await updateUserData({ email: sample.email.client, data })) as Record<string, any>;
    Object.keys(data).forEach((allowedProp) => {
      expect(updatedUser[allowedProp]).toEqual(data[allowedProp]);
    });
  });
  it('Should not update values that are not allowed', async () => {
    const user = (await getUserByEmail({email: sample.email.client })) as Record<string, any>;
    expect(user).not.toBeNull();
    const data = getUserDataToUpdate() as Record<string, any>;
    const updatedUser = (await updateUserData({ email: sample.email.client, data })) as Record<string, any>;
    propertiesBlockedFromBeingModified.forEach((blockedProp) => {
      expect(updatedUser?.[blockedProp]).toEqual(user?.[blockedProp]);
    });
  });
});

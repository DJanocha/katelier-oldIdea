import { connectDB, clearDB, closeDB } from 'src/tests/db';
import {
  loginAs,
  PasswordVariant,
  propertiesBlockedFromBeingModified,
  register,
  updateUserData,
  updateUserPassword,
  UpdateUserPasswordInput
} from 'src/services/authService';
import { countUsers, getUserByEmail } from 'src/services/userService';

const tooShortPassword = '123';
const validPassword = 'dupadupa';
const invalidPassword = 'dupadupaa';
const validEmail = 'emailfortesttt@test.test';
const takenEmail = 'emailfortest222222@test.test';
const invalidEmail = tooShortPassword;

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
    await register({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    usersCountBefore = await countUsers()
  });
  afterEach(async () => await clearDB());

  describe('given not matching passwords ', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: validEmail, password: validPassword, passwordConfirm: tooShortPassword })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given too short passwords', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: validEmail, password: tooShortPassword, passwordConfirm: tooShortPassword })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given invalid email ', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: invalidEmail, password: tooShortPassword, passwordConfirm: tooShortPassword })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given already taken email', () => {
    it('Does not let user register ', async () => {
      await expect(
        register({ email: takenEmail, password: validPassword, passwordConfirm: validPassword })
      ).rejects.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore);
    });
  });
  describe('given correct input', () => {
    it('Accepts user registration ', async () => {
      await expect(
        register({ email: validEmail, password: validPassword, passwordConfirm: validPassword })
      ).resolves.not.toThrow();
      await expect(countUsers()).resolves.toEqual(usersCountBefore + 1);
    });
  });
});

describe('login', () => {
  beforeEach(async () => {
    await register({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
  });
  it('Does not let you login with incorrect email or password', async () => {
    await expect(loginAs({ email: invalidEmail, password: validPassword })).rejects.toThrow();
    await expect(loginAs({ email: validEmail, password: invalidPassword })).rejects.toThrow();
  });

  it('lets you log in when email and password are matching', async () => {
    await expect(loginAs({ email: validEmail, password: validPassword })).resolves.not.toThrow();
  });
});

describe('update password', () => {
  const getAndMutateDataForUpdatingUser = (extendedProps: PasswordVariant[] = []) => {
    const data: Record<string, string> = {
      email: validEmail,
      currentPassword: invalidPassword,
      newPassword: validPassword,
      newPasswordConfirm: validPassword
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
   await register({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
  });
  it('Should not let to update password in update me route', async () => {
    await expect(getUserByEmail(validEmail)).resolves.not.toThrow();
    const dataVariants: Record<string, string>[] = [
      { newPassword: validPassword },
      { newPasswordConfirm: validPassword },
      {
        newPassword: validPassword,
        newPasswordConfirm: validPassword
      }
    ];
    await Promise.all(
      dataVariants.map(async (data) => {
        await expect(updateUserData({ email: validEmail, data })).rejects.toThrow();
      })
    );
  });
  it('Should let to update non-password values in update me route', async () => {
    const data = getUserDataToUpdate();
    await expect(updateUserData({ email: validEmail, data })).resolves.not.toThrow();
  });
  it('Should update every allowed property', async () => {
    const data = getUserDataToUpdate() as Record<string, any>;
    const updatedUser = (await updateUserData({ email: validEmail, data })) as Record<string, any>;
    Object.keys(data).forEach((allowedProp) => {
      expect(updatedUser[allowedProp]).toEqual(data[allowedProp]);
    });
  });
  it('Should not update values that are not allowed', async () => {
    const user = (await getUserByEmail(validEmail)) as Record<string, any>;
    expect(user).not.toBeNull();
    const data = getUserDataToUpdate() as Record<string, any>;
    const updatedUser = (await updateUserData({ email: validEmail, data })) as Record<string, any>;
    propertiesBlockedFromBeingModified.forEach((blockedProp) => {
      expect(updatedUser?.[blockedProp]).toEqual(user?.[blockedProp]);
    });
  });
});

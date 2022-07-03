import { User, UserType } from 'src/models';
import { connectDB, clearDB, closeDB } from 'src/tests/db';
import {
  loginAs,
  updateUserData,
  updateUserPassword,
  propertiesBlockedFromBeingModified,
  UpdateUserPasswordInput,
  PasswordVariant
} from 'src/utils/authUtils';

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
  beforeEach(async () => {
    const currentUser = new User({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    await currentUser.save();
  });
  afterEach(async () => await clearDB());
  it('Blocks user registration when passwords do not match', async () => {
    const usersCountBefore = await User.find().count();
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(usersCountBefore);
  });
  it('Blocks user registration when passwords are too short', async () => {
    const usersCountBefore = await User.find().count();
    const newUser = new User({ email: validEmail, password: tooShortPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(usersCountBefore);
  });
  it('Blocks user registration when email is invalid', async () => {
    const usersCountBefore = await User.find().count();
    const newUser = new User({ email: invalidEmail, password: tooShortPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(usersCountBefore);
  });
  it('Does not add new user when email is already taken', async () => {
    const usersCountBefore = await User.find().count();
    const newUser = new User({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    await expect(newUser.save()).rejects.toThrow();
    await expect(User.find()).resolves.toHaveLength(usersCountBefore);
  });
  it('Accepts user registration when input correct', async () => {
    const usersCountBefore = await User.find().count();
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await expect(newUser.save()).resolves.not.toThrow();
    await expect(User.find()).resolves.toHaveLength(usersCountBefore + 1);
  });
});

describe('login', () => {
  beforeEach(async () => {
    const existingUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await existingUser.save();
  });
  it('does not let you login with incorrect email or password', async () => {
    await expect(loginAs({ email: invalidEmail, pass: validPassword })).rejects.toThrow();
  });

  it('lets you log in when email and password are matching', async () => {
    await expect(loginAs({ email: validEmail, pass: validPassword })).resolves.not.toThrow();
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
  it('does not let you update password when current password typed incorrectly', async () => {
    await expect(updateUserPassword(getAndMutateDataForUpdatingUser())).rejects.toThrow();
  });
  it('does not let you update password when new password and new password confirm  do not match', async () => {
    await expect(updateUserPassword(getAndMutateDataForUpdatingUser(['newPasswordConfirm']))).rejects.toThrow();
  });
  it('lets you update password when new passwords match and current password is valid ', async () => {
    await expect(
      updateUserPassword(getAndMutateDataForUpdatingUser(['newPasswordConfirm', 'newPassword']))
    ).rejects.toThrow();
  });
});
describe('update me', () => {
  beforeEach(async () => {
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await newUser.save();
  });
  it('Should not let to update password in update me route', async () => {
    await expect(User.find({ email: validEmail })).resolves.not.toThrow();
    const dataVariants: Record<string, any>[] = [
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
    const user = (await User.findOne({ email: validEmail })) as Record<string, any>;
    expect(user).not.toBeNull();
    const data = getUserDataToUpdate() as Record<string, any>;
    const updatedUser = (await updateUserData({ email: validEmail, data })) as Record<string, any>;
    propertiesBlockedFromBeingModified.forEach((blockedProp) => {
      expect(updatedUser?.[blockedProp]).toEqual(user?.[blockedProp]);
    });
  });
});

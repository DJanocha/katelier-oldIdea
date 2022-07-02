import supertest from 'supertest';
import express from 'express';
import { register, login } from 'src/controllers/auth';
import { User, UserType } from 'src/models';
import { connectDB, clearDB, closeDB } from 'src/tests/db';
import { loginAs, updateUserData, updateUserPassword, propertiesBlockedFromBeingModified } from 'src/utils/authUtils';

const tooShortPassword = '123';
const validPassword = 'dupadupa';
const invalidPassword = 'dupadupaa';
const validEmail = 'emailfortest@test.test';
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

// we can use callacks in two ways:
// async () => {}
// or (done)=>{}
// describe('registration', () => {
//   it('Accepts user registration when input correct', async () => {
//     expect(2).toEqual(2);
//     // await register
//     // const response = await supertest(app)
//     const response = await supertest('localhost:4444/api/v1/')
//       .post('register')
//       .send({ email: validEmail, password: validPassword })
//       .set('Accept', 'application/json')
//       .expect((res) => {
//         console.log({ body: res.body });
//         return true;
//         // res.body.user.email === validEmail;
//         // res.body.password = validPassword;
//       });
//     expect(2).toBe(2);
//     //   .expect(200);
//   });
// });
describe('register', () => {
  it('Blocks user registration when passwords do not match', async () => {
    await expect(User.find()).resolves.toHaveLength(0);
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(0);
  });
  it('Blocks user registration when passwords are too short', async () => {
    await expect(User.find()).resolves.toHaveLength(0);
    const newUser = new User({ email: validEmail, password: tooShortPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(0);
  });
  it('Blocks user registration when email is invalid', async () => {
    await expect(User.find()).resolves.toHaveLength(0);
    const newUser = new User({ email: invalidEmail, password: tooShortPassword, passwordConfirm: tooShortPassword });
    await expect(newUser.save()).rejects.toThrowError();
    await expect(User.find()).resolves.toHaveLength(0);
  });
  it('Blocks user registration when email is already taken', async () => {
    await expect(User.find()).resolves.toHaveLength(0);
    const firstUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await expect(firstUser.save()).resolves.not.toThrowError();
    await expect(User.find()).resolves.toHaveLength(1);
    const secondUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await expect(secondUser.save()).rejects.toThrow();
    await expect(User.find()).resolves.toHaveLength(1);
  });
  it('Accepts user registration when input correct', async () => {
    await expect(User.find()).resolves.toHaveLength(0);
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await expect(newUser.save()).resolves.not.toThrow();
    await expect(User.find()).resolves.toHaveLength(1);
  });
});

describe('login', () => {
  beforeEach(async () => {
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await newUser.save();
  });
  it('does not let you login with incorrect email', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    await expect(loginAs({ email: invalidEmail, pass: validPassword })).rejects.toThrow();
  });

  it('does not let you login with incorrect password', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    await expect(loginAs({ email: validEmail, pass: invalidPassword })).rejects.toThrow();
  });
  it('lets you log in when email and password are matching', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    await expect(loginAs({ email: validEmail, pass: validPassword })).resolves.not.toThrow();
  });
});

describe('update password', () => {
  beforeEach(async () => {
    const newUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    await newUser.save();
  });
  it('does not let you update password when current password typed incorrectly', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    // await expect(loginAs({ email: invalidEmail, pass: validPassword })).rejects.toThrow();
    await expect(
      updateUserPassword({
        email: validEmail,
        currentPassword: invalidPassword,
        newPassword: validPassword,
        newPasswordConfirm: validPassword
      })
    ).rejects.toThrow();
  });
  it('does not let you update password when new password and new password confirm  do not match', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    // await expect(loginAs({ email: invalidEmail, pass: validPassword })).rejects.toThrow();
    await expect(
      updateUserPassword({
        email: validEmail,
        currentPassword: validPassword,
        newPassword: validPassword,
        newPasswordConfirm: validPassword + 'anything'
      })
    ).rejects.toThrow();
  });
  it('lets you update password when new passwords match and current password is valid ', async () => {
    await expect(User.find()).resolves.not.toHaveLength(0);
    // await expect(loginAs({ email: invalidEmail, pass: validPassword })).rejects.toThrow();
    await expect(
      updateUserPassword({
        email: validEmail,
        currentPassword: validPassword,
        newPassword: validPassword + 'anything',
        newPasswordConfirm: validPassword + 'anything'
      })
    ).resolves.not.toThrow();
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

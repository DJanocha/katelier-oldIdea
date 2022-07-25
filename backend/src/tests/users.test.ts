import { Category, User } from 'src/models';
import { CategoryDocument } from 'src/models/categories';
import { addCategory } from 'src/services/userService';
import { connectDB, clearDB, closeDB } from './db';
import { Types } from 'mongoose';
import { register } from 'src/services/authService';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const validEmail = 'emailfortesttt@test.test';
const secondValidEmail = 'second' + validEmail;
const firstCategoryName = 'first category';

describe('adding new category', () => {
  let categoriesCountBefore: number;
  let firstUserId: Types.ObjectId;
  let secondUserId: Types.ObjectId;

  beforeEach(async () => {
    const firstUser= await register({ email: validEmail, password: validPassword, passwordConfirm: validPassword })
    firstUserId = firstUser._id;
    await addCategory(firstUser._id, firstCategoryName)

    const secondUser = await register({ email: secondValidEmail, password: validPassword, passwordConfirm: validPassword });
    secondUserId = secondUser._id;
    categoriesCountBefore = await Category.find().count();
  });

  describe('given already occupied category name for given user', () => {
    it('Should not let create the category ', async () => {
      await expect(addCategory(firstUserId, firstCategoryName)).rejects.toThrow();

      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesCountBefore);
    });
  });
  describe('given category name not occupied yet by given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(firstUserId, firstCategoryName + '1')).resolves.not.toThrow();

      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
  describe('given category name used by someone else but not given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(secondUserId, firstCategoryName)).resolves.not.toThrow();
      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
});

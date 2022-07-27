import { addCategory, removeCategory } from 'src/services/categoriesService';
import { connectDB, clearDB, closeDB } from './db';
import { Types } from 'mongoose';
import { register } from 'src/services/authService';
import { countAllCategoies } from 'src/services/categoriesService';
import { addProject } from 'src/services/projectService';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const validEmail = 'emailfortesttt@test.test';
const secondValidEmail = 'second' + validEmail;
const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project';

describe('adding new category', () => {
  let categoriesCountBefore: number;
  let firstUserId: Types.ObjectId;
  let secondUserId: Types.ObjectId;

  beforeEach(async () => {
    const firstUser = await register({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    firstUserId = firstUser._id;
    await addCategory(firstUser._id, firstCategoryName);

    const secondUser = await register({
      email: secondValidEmail,
      password: validPassword,
      passwordConfirm: validPassword
    });
    secondUserId = secondUser._id;
    categoriesCountBefore = await countAllCategoies();
  });

  describe('given already occupied category name for given user', () => {
    it('Should not let create the category ', async () => {
      await expect(addCategory(firstUserId, firstCategoryName)).rejects.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore);
    });
  });
  describe('given category name not occupied yet by given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(firstUserId, firstCategoryName + '1')).resolves.not.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
  describe('given category name used by someone else but not given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(secondUserId, firstCategoryName)).resolves.not.toThrow();
      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
});

describe('removing a category', () => {
  let firstCategoryId: Types.ObjectId;
  let secondCategoryId: Types.ObjectId;

  beforeEach(async () => {
    const firstUser = await register({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    const firstCategory = await addCategory(firstUser._id, firstCategoryName);
    firstCategoryId = firstCategory._id;
    const secondCategory = await addCategory(firstUser._id, secondCategoryName);
    secondCategoryId = secondCategory._id;
    await addProject(firstUser._id, firstCategory._id, firstProjectName);
  });
  describe('given not empty catetegory', () => {
    it('should not let remove it', async () => {
      const countBefore = await countAllCategoies();
      await expect(removeCategory(firstCategoryId)).rejects.toThrow();
      const countAfter = await countAllCategoies();
      expect(countAfter).toEqual(countBefore);
    });
  });
  describe('given empty catetegory', () => {
    it('should let remove it', async () => {
      const countBefore = await countAllCategoies();
      await expect(removeCategory(secondCategoryId)).resolves.not.toThrow();
      const countAfter = await countAllCategoies();
      expect(countAfter).toEqual(countBefore - 1);
    });
  });
});

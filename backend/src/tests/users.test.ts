import { Category, User } from 'src/models';
import { UserDocument } from 'src/models/users';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const validEmail = 'emailfortesttt@test.test';
const secondValidEmail = 'second' + validEmail;
const firstCategoryName = 'first category';

describe('adding new category', () => {
  beforeEach(async () => {
    const firstCategory = new Category({ name: firstCategoryName });
    await firstCategory.save();

    const firstUser = new User({ email: validEmail, password: validPassword, passwordConfirm: validPassword });
    firstUser.categories = [firstCategory._id];
    await firstUser.save();

    const secondUser = new User({ email: secondValidEmail, password: validPassword, passwordConfirm: validPassword });
    await secondUser.save();
  });

  describe('given already occupied category name for given user', () => {
    it('Should not let create the category ', async () => {
      const categoriesBefore = await Category.find().count();
      const me = await User.findOne<UserDocument>({ email: validEmail });
      expect(me).toBeTruthy();
      await expect(me?.addCategory(firstCategoryName)).rejects.toThrow();

      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesBefore);
    });
  });
  describe('given valid  category name', () => {
    it('Should create new category', async () => {
      const categoriesBefore = await Category.find().count();
      const me = await User.findOne<UserDocument>();
      expect(me).toBeTruthy();
      await expect(me?.addCategory(firstCategoryName + '1')).resolves.not.toThrow();

      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesBefore + 1);
    });
  });
  describe('given category name user by someone else but not given user', () => {
    it('Should create new category', async () => {
      const categoriesBefore = await Category.find().count();
      const me = await User.findOne<UserDocument>({ email: secondValidEmail });
      await expect(me?.addCategory(firstCategoryName)).resolves.not.toThrow();
      const categoriesAfter = await Category.find().count();
      expect(categoriesAfter).toEqual(categoriesBefore + 1);
    });
  });
});

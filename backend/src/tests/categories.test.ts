import { addCategory, removeCategory } from 'src/services/categoriesService';
import { connectDB, clearDB, closeDB } from './db';
import { Types } from 'mongoose';
import { register, registerArtist } from 'src/services/authService';
import { countAllCategoies } from 'src/services/categoriesService';
import { addProject } from 'src/services/projectService';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const artistUserEmail = 'bubu@bubu.bubu';
const clientUserEmail = 'client@client.client';
const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project';

describe('adding new category', () => {
  let categoriesCountBefore: number;
  let artistUserId: Types.ObjectId;
  let clientUserId: Types.ObjectId;

  beforeEach(async () => {
    const artistUser = await registerArtist({
      email: artistUserEmail,
      password: validPassword,
      passwordConfirm: validPassword
    });
    artistUserId = artistUser._id;
    await addCategory(artistUser._id, firstCategoryName);

    const clientUser = await register({
      email: clientUserEmail,
      password: validPassword,
      passwordConfirm: validPassword
    });
    clientUserId = clientUser._id;
    categoriesCountBefore = await countAllCategoies();
  });

  describe('given already occupied category name for given user', () => {
    it('Should not let create the category ', async () => {
      await expect(addCategory(artistUserId, firstCategoryName)).rejects.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore);
    });
  });
  describe('given category name not occupied yet by given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(artistUserId, firstCategoryName + '1')).resolves.not.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
  describe('when trying to add category to client user', () => {
    it('should not create new category', async () => {
      await expect(addCategory(clientUserId, firstCategoryName)).rejects.toThrow();
      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore);
    });
  });
});

describe('removing a category', () => {
  let firstCategoryId: Types.ObjectId;
  let secondCategoryId: Types.ObjectId;

  beforeEach(async () => {
    const artistUser = await registerArtist({
      email: artistUserEmail,
      password: validPassword,
      passwordConfirm: validPassword
    });
    const firstCategory = await addCategory(artistUser._id, firstCategoryName);
    firstCategoryId = firstCategory._id;
    const secondCategory = await addCategory(artistUser._id, secondCategoryName);
    secondCategoryId = secondCategory._id;
    await addProject(artistUser._id, firstCategory._id, firstProjectName);
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

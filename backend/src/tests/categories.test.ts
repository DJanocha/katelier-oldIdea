import { addCategory, removeCategory } from 'src/services/categoriesService';
import { connectDB, clearDB, closeDB } from './db';
import { Types } from 'mongoose';
import { register, registerArtist } from 'src/services/authService';
import { countAllCategoies } from 'src/services/categoriesService';
import { addProject } from 'src/services/projectService';
import { sample } from 'src/utils';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('adding new category', () => {
  let categoriesCountBefore: number;
  let artistUserId: Types.ObjectId;
  let clientUserId: Types.ObjectId;

  beforeEach(async () => {
    const artistUser = await registerArtist({
      email: sample.email.artist,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    artistUserId = artistUser._id;
    await addCategory(artistUser._id, sample.names.category[0]);

    const clientUser = await register({
      email: sample.email.client,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    clientUserId = clientUser._id;
    categoriesCountBefore = await countAllCategoies();
  });

  describe('given already occupied category name for given user', () => {
    it('Should not let create the category ', async () => {
      await expect(addCategory(artistUserId, sample.names.category[0])).rejects.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore);
    });
  });
  describe('given category name not occupied yet by given user', () => {
    it('Should create new category', async () => {
      await expect(addCategory(artistUserId, sample.names.category[0] + '1')).resolves.not.toThrow();

      const categoriesAfter = await countAllCategoies();
      expect(categoriesAfter).toEqual(categoriesCountBefore + 1);
    });
  });
  describe('when trying to add category to client user', () => {
    it('should not create new category', async () => {
      await expect(addCategory(clientUserId, sample.names.category[0])).rejects.toThrow();
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
      email: sample.email.artist,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    const firstCategory = await addCategory(artistUser._id, sample.names.category[0]);
    firstCategoryId = firstCategory._id;
    const secondCategory = await addCategory(artistUser._id, sample.names.category[1]);
    secondCategoryId = secondCategory._id;
    await addProject(artistUser._id, firstCategory._id, sample.names.project[1]);
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

import { Types } from 'mongoose';
import { Category, Project } from 'src/models';
import { connectDB, clearDB, closeDB } from './db';
import { addProject } from 'src/services/categoriesService';
import { register } from 'src/services/authService';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const takenEmail = 'emailfortest222222@test.test';
const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project name';
describe('adding new project', () => {
  let projectsCountBefore: number;
  let firstCategoryId: Types.ObjectId;
  let secondCategoryId: Types.ObjectId;
  let userId: Types.ObjectId;

  beforeEach(async () => {
    const user = await register({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    userId = user._id;
    const firstCategory = new Category({ name: firstCategoryName });
    const firstProject = new Project({ name: firstProjectName, category: firstCategory._id });
    firstCategory.projects.push(firstProject._id);
    firstCategoryId = firstCategory._id;
    await firstProject.save();
    await firstCategory.save();
    const secondCategory = new Category({ name: secondCategoryName });
    secondCategoryId = secondCategory._id;
    await secondCategory.save();
    projectsCountBefore = await Project.find().count();
  });

  describe('given project name', () => {
    describe('given already occupied project name for given category', () => {
      it('Should NOT let create new project', async () => {
        await expect(addProject(userId,firstCategoryId, firstProjectName)).rejects.toThrow();

        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore);
      });
    });
    describe('given project name NOT occupied yet by given category ', () => {
      it('Should create new project', async () => {
        await expect(addProject(userId,secondCategoryId, firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
    describe('given project name used by OTHER category', () => {
      it('Should create new project', async () => {

        await expect(addProject(userId,secondCategoryId, firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
  });
});

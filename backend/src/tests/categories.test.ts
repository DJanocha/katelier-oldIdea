import { Category, Project } from 'src/models';
import { CategoryDocument } from 'src/models/categories';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project name';
describe('adding new project', () => {
  let projectsCountBefore: number;

  beforeEach(async () => {
    const firstCategory = new Category({ name: firstCategoryName });
    const firstProject = new Project({ name: firstProjectName, category: firstCategory._id });
    firstCategory.projects.push(firstProject._id);
    await firstProject.save();
    await firstCategory.save();
    const secondCategory = new Category({ name: secondCategoryName });
    await secondCategory.save();
    projectsCountBefore = await Project.find().count();
  });

  describe('given project name', () => {
    describe('given already occupied project name for given category', () => {
      it('Should NOT let create new project', async () => {
        const category = await Category.findOne<CategoryDocument>({ name: firstCategoryName });

        await expect(category?.addProject(firstProjectName)).rejects.toThrow();
        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore);
      });
    });
    describe('given project name NOT occupied yet by given category ', () => {
      it('Should create new project', async () => {
        const category = await Category.findOne<CategoryDocument>({ name: secondCategoryName });

        await expect(category?.addProject(firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
    describe('given project name used by OTHER category', () => {
      it('Should create new project', async () => {
        const category = await Category.findOne<CategoryDocument>({ name: secondCategoryName });

        await expect(category?.addProject(firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await Project.find().count();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
  });
});

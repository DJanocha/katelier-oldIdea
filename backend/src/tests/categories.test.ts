import { Category, Project } from 'src/models';
import { CategoryDocument } from 'src/models/categories';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project name';
describe('given project name', () => {
  beforeEach(async () => {
    const firstProject = new Project({ name: firstProjectName });
    await firstProject.save();
    const firstCategory = new Category({ name: firstCategoryName });
    firstCategory.projects.push(firstProject._id);
    await firstCategory.save();
    const secondCategory = new Category({ name: secondCategoryName });
    await secondCategory.save();
  });
  describe.only('when occupied in given category', () => {
    it('should NOT create new project', async () => {
      const projectsBefore = await Project.find().count();
      const category = await Category.findOne<CategoryDocument>({ name: firstCategoryName });

      await expect(category?.addProject(firstProjectName)).rejects.toThrow();
      const projectsAfter = await Project.find().count();
      expect(projectsAfter).toEqual(projectsBefore);
    });
  });
  describe.only('when occupied in other  category', () => {
    it('should create new project', async () => {
      const projectsBefore = await Project.find().count();
      const category = await Category.findOne<CategoryDocument>({ name: secondCategoryName });

      await expect(category?.addProject(firstProjectName)).resolves.not.toThrow();
      const projectsAfter = await Project.find().count();
      expect(projectsAfter).toEqual(projectsBefore + 1);
    });
  });
});

import { Types } from 'mongoose';
import { connectDB, clearDB, closeDB } from './db';
import { addProject, removeProject } from 'src/services/projectService';
import { register, registerArtist } from 'src/services/authService';
import { addCategory } from 'src/services/categoriesService';
import { countAllProjects } from 'src/services/projectService';
import { addStep } from 'src/services/stepService';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const validPassword = 'dupadupa';
const takenEmail = 'emailfortest222222@test.test';
const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project name';
const secondProjectName = 'second project name';
const projectName = 'project name';
const now = new Date();
const time12 = new Date();
time12.setHours(12, 20);
const time14 = new Date();
time14.setHours(14, 20);

describe('adding new project', () => {
  let projectsCountBefore: number;
  let firstCategoryId: Types.ObjectId;
  let secondCategoryId: Types.ObjectId;
  let userId: Types.ObjectId;

  beforeEach(async () => {
    const user = await registerArtist({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    userId = user._id;
    const firstCategory = await addCategory(userId, firstCategoryName);
    await addProject(user._id, firstCategory._id, firstProjectName);

    firstCategoryId = firstCategory._id;
    const secondCategory = await addCategory(user._id, secondCategoryName);
    secondCategoryId = secondCategory._id;
    await addProject(userId, firstCategoryId, projectName);
    projectsCountBefore = await countAllProjects();
  });

  describe('given project name', () => {
    describe('given already occupied project name for given category', () => {
      it('Should NOT let create new project', async () => {
        await expect(addProject(userId, firstCategoryId, firstProjectName)).rejects.toThrow();

        const projectsAfter = await countAllProjects();
        expect(projectsAfter).toEqual(projectsCountBefore);
      });
    });
    describe('given project name NOT occupied yet by given category ', () => {
      it('Should create new project', async () => {
        await expect(addProject(userId, secondCategoryId, firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await countAllProjects();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
    describe('given project name used by OTHER category', () => {
      it('Should create new project', async () => {
        await expect(addProject(userId, secondCategoryId, firstProjectName)).resolves.not.toThrow();
        const projectsAfter = await countAllProjects();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
  });
});

describe('removing a project', () => {
  let firstCategoryId: Types.ObjectId;
  let firstProjectId: Types.ObjectId;
  let secondProjectId: Types.ObjectId;

  beforeEach(async () => {
    const firstUser = await registerArtist({
      email: takenEmail,
      password: validPassword,
      passwordConfirm: validPassword
    });
    const firstCategory = await addCategory(firstUser._id, firstCategoryName);
    firstCategoryId = firstCategory._id;
    await addCategory(firstUser._id, secondCategoryName);
    const firstProject = await addProject(firstUser._id, firstCategory._id, firstProjectName);
    firstProjectId = firstProject._id;
    const secondProject = await addProject(firstUser._id, firstCategory._id, secondProjectName);
    secondProjectId = secondProject._id;

    await addStep({
      categoryId: firstCategoryId,
      date: now,
      projectId: firstProjectId,
      start_time: time12,
      stop_time: time14,
      userId: firstUser._id
    });
  });
  describe('given not empty project', () => {
    it('should not let remove it', async () => {
      const countBefore = await countAllProjects();
      await expect(removeProject(firstProjectId)).rejects.toThrow();
      const countAfter = await countAllProjects();
      expect(countAfter).toEqual(countBefore);
    });
  });
  describe('given empty project', () => {
    it('should let remove it', async () => {
      const countBefore = await countAllProjects();
      await expect(removeProject(secondProjectId)).resolves.not.toThrow();
      const countAfter = await countAllProjects();
      expect(countAfter).toEqual(countBefore - 1);
    });
  });
});

// describe('listing projects for given category', () => {});

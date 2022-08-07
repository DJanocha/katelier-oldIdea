import { Types } from 'mongoose';
import { connectDB, clearDB, closeDB } from './db';
import { addProject, getProject, removeProject } from 'src/services/projectService';
import { registerArtist } from 'src/services/authService';
import { addCategory } from 'src/services/categoriesService';
import { countAllProjects } from 'src/services/projectService';
import { addStep } from 'src/services/stepService';
import { newDate, sample } from 'src/utils';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const now = newDate();
const time12 = newDate({ hours: 12, minutes: 20 });
const time14 = newDate({ hours: 14, minutes: 20 });

describe('adding new project', () => {
  let projectsCountBefore: number;
  let firstCategoryId: Types.ObjectId;
  let secondCategoryId: Types.ObjectId;
  let artistId: Types.ObjectId;

  beforeEach(async () => {
    const artist = await registerArtist({
      email: sample.email.taken,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    artistId = artist._id;
    const firstCategory = await addCategory({ userId: artistId, newCategoryName: sample.names.category[0] });
    await addProject({ userId: artist._id, categoryId: firstCategory._id, newProjectData: {name :sample.names.project[0] }});

    firstCategoryId = firstCategory._id;
    const secondCategory = await addCategory({ userId: artist._id, newCategoryName: sample.names.category[1] });
    secondCategoryId = secondCategory._id;
    await addProject({ userId: artistId, categoryId: firstCategoryId, newProjectData: {name :sample.names.project[1] }});
    projectsCountBefore = await countAllProjects();
  });

  describe('given project name', () => {
    describe('given already occupied project name for given category', () => {
      it('Should NOT let create new project', async () => {
        await expect(
          addProject({ userId: artistId, categoryId: firstCategoryId, newProjectData: {name :sample.names.project[0] }})
        ).rejects.toThrow();

        const projectsAfter = await countAllProjects();
        expect(projectsAfter).toEqual(projectsCountBefore);
      });
    });
    describe('given project name NOT occupied yet by given category ', () => {
      it('Should create new project', async () => {
        await expect(
          addProject({ userId: artistId, categoryId: secondCategoryId, newProjectData: {name :sample.names.project[0] }})
        ).resolves.not.toThrow();
        const projectsAfter = await countAllProjects();
        expect(projectsAfter).toEqual(projectsCountBefore + 1);
      });
    });
    describe('given project name used by OTHER category', () => {
      it('Should create new project', async () => {
        await expect(
          addProject({ userId: artistId, categoryId: secondCategoryId, newProjectData: {name :sample.names.project[0] }})
        ).resolves.not.toThrow();
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
    const artist = await registerArtist({
      email: sample.email.taken,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    const firstCategory = await addCategory({ userId: artist._id, newCategoryName: sample.names.category[0] });
    firstCategoryId = firstCategory._id;
    await addCategory({ userId: artist._id, newCategoryName: sample.names.category[1] });
    const firstProject = await addProject({
      userId: artist._id,
      categoryId: firstCategory._id,
      newProjectData: {name :sample.names.project[0]}
    });
    firstProjectId = firstProject._id;
    const secondProject = await addProject({
      userId: artist._id,
      categoryId: firstCategory._id,
      newProjectData: {name :sample.names.project[1]}
    });
    secondProjectId = secondProject._id;

    await addStep({
      categoryId: firstCategoryId,
      date: now,
      projectId: firstProjectId,
      start_time: time12,
      stop_time: time14,
      userId: artist._id
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

describe('getting the project', () => {
  const img = 'example image path';
  let firstProjectId: Types.ObjectId;
  let secondProjectId: Types.ObjectId;
  const date = new Date();
  const start_time = new Date();
  start_time.setHours(12, 20);
  const stop_time = new Date();
  stop_time.setHours(14, 20);
  beforeEach(async () => {
    const artist = await registerArtist({
      email: sample.email.taken,
      password: sample.pass.valid,
      passwordConfirm: sample.pass.valid
    });
    const artistId = artist._id;
    const firstCategory = await addCategory({ userId: artistId, newCategoryName: sample.names.category[0] });
    const firstCategoryId = firstCategory._id;
    const first = await addProject({
      userId: artistId,
      categoryId: firstCategoryId,
      newProjectData: {name :sample.names.project[0]}
    });
    const second = await addProject({
      userId: artistId,
      categoryId: firstCategoryId,
      newProjectData: {name :sample.names.project[1]}
    });
    firstProjectId = first._id;
    secondProjectId = second._id;
    await addStep({
      categoryId: firstCategoryId,
      projectId: firstProjectId,
      date,
      start_time,
      stop_time,
      userId: artistId,
      img
    });
  });
  describe('when at least 1 step added', () => {
    it('should get project with proper last_step_image', async () => {
      const projectWithSteps = await getProject(firstProjectId);
      expect(projectWithSteps?.lastStepImg).toEqual(img);
    });
  });
  describe('when no steps added', () => {
    it('should get project with empty last_step_image', async () => {
      const projectWithoutSteps = await getProject(secondProjectId);
      expect(projectWithoutSteps?.lastStepImg).toEqual(undefined);
    });
  });
});

// describe('listing projects for given category', () => {});

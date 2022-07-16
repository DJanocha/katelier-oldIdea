import { Activity } from 'src/models';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const start_time = '12:20';
const stop_time = '14:20';
const stop_time2 = '16:20';
const invalidTime = '17:80';
const templateName = 'klasyczne kardio';
const templateName2 = 'medytacja';
const actualActivityName = 'jutrzejsza wyprawa';
const actualActivityName2 = 'jutrzejsza meczarnia';

describe.only('adding new template', () => {
  let templatesCountBefore: number;
  let activitiesCountBefore: number;
  let allActivitiesCountBefore: number;

  beforeEach(async () => {
    await Activity.create({ start_time, stop_time, name: templateName });
    await Activity.create({
      start_time,
      stop_time: stop_time2,
      date: Date.now(),
      name: actualActivityName
    });
    templatesCountBefore = (await Activity.getTemplates()).length;
    allActivitiesCountBefore = (await Activity.find()).length;
    activitiesCountBefore = allActivitiesCountBefore - templatesCountBefore;
  });
  it('should return proper ammount of templates from database', async () => {
    const temps = await Activity.getTemplates();
    expect(temps).toHaveLength(1);
  });
  describe('when given invalid start-time or stop_time', () => {
    it('should not create either activity or template', async () => {
      await expect(Activity.create({ start_time, stop_time: invalidTime, name: templateName })).rejects.toThrow();
      await expect(Activity.create({ start_time: invalidTime, stop_time, name: templateName })).rejects.toThrow();
      await expect(
        Activity.create({ start_time: invalidTime, stop_time, date: Date.now(), name: actualActivityName2 })
      ).rejects.toThrow();
      await expect(
        Activity.create({ start_time, stop_time: invalidTime, date: Date.now(), name: actualActivityName2 })
      ).rejects.toThrow();
    });
  });

  describe('when creating template using uccupied name', () => {
    it('should not create new template', async () => {
      await expect(Activity.create({ start_time, stop_time, name: templateName })).rejects.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      expect(templatesCountAfter).toEqual(templatesCountBefore);
    });
  });
  describe('when given ok data with  date ', () => {
    it('should create actual activity', async () => {
      await expect(
        Activity.create({ start_time, stop_time, date: Date.now(), name: templateName })
      ).resolves.not.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      const allActivitesCountAfter = (await Activity.find()).length;
      const activitiesCountAfter = allActivitesCountAfter - templatesCountAfter;

      expect(templatesCountAfter).toEqual(templatesCountBefore);
      expect(activitiesCountAfter).toEqual(activitiesCountBefore + 1);
      expect(allActivitesCountAfter).toEqual(allActivitiesCountBefore + 1);
    });
  });
  describe('when given ok data without date ', () => {
    it('should create template activity', async () => {
      await expect(Activity.create({ start_time, stop_time, name: templateName2 })).resolves.not.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      const allActivitesCountAfter = (await Activity.find()).length;
      const activitiesCountAfter = allActivitesCountAfter - templatesCountAfter;

      expect(templatesCountAfter).toEqual(templatesCountBefore + 1);
      expect(activitiesCountAfter).toEqual(activitiesCountBefore);
      expect(allActivitesCountAfter).toEqual(allActivitiesCountBefore + 1);
    });
  });
});

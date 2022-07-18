import { Activity } from 'src/models';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const start_time = new Date();
start_time.setHours(12, 20);

const stop_time = new Date();
stop_time.setHours(14, 20);

const stop_time2 = new Date();
stop_time2.setHours(16, 20);
const templateName = 'klasyczne kardio';
const templateName2 = 'medytacja';
const eventName = 'jutrzejsza wyprawa';
const eventName2 = 'jutrzejsza meczarnia';

describe('adding new template', () => {
  let templatesCountBefore: number;
  let eventsCountBefore: number;
  let allActivitiesCountBefore: number;

  beforeEach(async () => {
    await Activity.create({ start_time, stop_time, name: templateName });
    await Activity.create({
      start_time,
      stop_time: stop_time2,
      date: Date.now(),
      name: eventName
    });
    templatesCountBefore = (await Activity.getTemplates()).length;
    allActivitiesCountBefore = (await Activity.find()).length;
    eventsCountBefore = (await Activity.getEvents()).length;
  });
  it('should return proper ammount of templates from database', async () => {
    const temps = await Activity.getTemplates();
    expect(temps).toHaveLength(1);
  });
  describe('when given invalid start-time or stop_time', () => {
    it('should not create either event or template', async () => {
      await expect(Activity.create({ start_time, stop_time: invalidTime, name: templateName })).rejects.toThrow();
      await expect(Activity.create({ start_time: invalidTime, stop_time, name: templateName })).rejects.toThrow();
      await expect(
        Activity.create({ start_time: invalidTime, stop_time, date: Date.now(), name: eventName2 })
      ).rejects.toThrow();
      await expect(
        Activity.create({ start_time, stop_time: invalidTime, date: Date.now(), name: eventName2 })
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
    it('should create event', async () => {
      await expect(
        Activity.create({ start_time, stop_time, date: Date.now(), name: templateName })
      ).resolves.not.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      const allActivitesCountAfter = (await Activity.find()).length;
      const eventsCountAfter = (await Activity.getEvents()).length;

      expect(templatesCountAfter).toEqual(templatesCountBefore);
      expect(eventsCountAfter).toEqual(eventsCountBefore + 1);
      expect(allActivitesCountAfter).toEqual(allActivitiesCountBefore + 1);
    });
  });
  describe('when given ok data without date ', () => {
    it('should create template activity', async () => {
      await expect(Activity.create({ start_time, stop_time, name: templateName2 })).resolves.not.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      const allActivitesCountAfter = (await Activity.find()).length;
      const eventsCountAfter = (await Activity.getEvents()).length;

      expect(templatesCountAfter).toEqual(templatesCountBefore + 1);
      expect(eventsCountAfter).toEqual(eventsCountBefore);
      expect(allActivitesCountAfter).toEqual(allActivitiesCountBefore + 1);
    });
  });
});

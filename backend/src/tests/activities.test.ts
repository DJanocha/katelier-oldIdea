import { Activity } from 'src/models';
import { createEvent } from 'src/services/activitiesService';
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
const now = new Date();

describe('adding new template', () => {
  let templatesCountBefore: number;
  let eventsCountBefore: number;
  let allActivitiesCountBefore: number;

  beforeEach(async () => {
    await Activity.create({ start_time, stop_time, name: templateName });
    await Activity.create({
      start_time,
      stop_time: stop_time2,
      date: now,
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

  describe('when creating template using uccupied name', () => {
    it('should not create new template', async () => {
      await expect(Activity.create({ start_time, stop_time, name: templateName })).rejects.toThrow();
      const templatesCountAfter = (await Activity.getTemplates()).length;
      expect(templatesCountAfter).toEqual(templatesCountBefore);
    });
  });
  describe('when given ok data with  date ', () => {
    it('should create event', async () => {
      await expect(Activity.create({ start_time, stop_time, date: now, name: templateName })
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
  describe('when could overlap other event timespan', () => {
    it('should not let create that', async () => {
      await expect(createEvent({ date: now, start_time, stop_time, name: 'overlaying activity' })).rejects.toThrow();
    });
  });
  describe('when not overlapping other event timespan', () => {
    it('should create new event', async () => {
      const tomorrow = new Date();
      tomorrow.setFullYear(tomorrow.getFullYear() + 2);
      await expect(
        createEvent({ date: tomorrow, start_time, stop_time, name: 'not overlaying activity' })
      ).resolves.not.toThrow();
    });
  });
});

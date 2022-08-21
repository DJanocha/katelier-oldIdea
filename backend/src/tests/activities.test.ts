import { Types } from 'mongoose';
import {
  createEvent,
  createTemplate,
  getActivities,
  getEvents,
  getTemplates,
  updateActivity
} from 'src/services/activitiesService';
import { register, registerArtist } from 'src/services/authService';
import { connectDB, clearDB, closeDB } from './db';
beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const time12 = new Date();
time12.setHours(12, 20);

const time14 = new Date();
time14.setHours(14, 20);

const time16 = new Date();
time16.setHours(16, 20);

const time18 = new Date();
time18.setHours(18, 20);

const occupiedTemplateName = 'klasyczne kardio';
const templateName = 'medytacja';
const occupiedEventName = 'jutrzejsza wyprawa';
const eventName = 'jutrzejsza meczarnia';
const now = new Date();
const validPassword = 'dupadupa';
const takenEmail = 'emailfortest222222@test.test';

const getAllActivitiesKindsCounts = async () => {
  // const temps = (await Activity.getTemplates()).length;
  const temps = (await getTemplates()).length;
  const all = (await getActivities()).length;
  const events = (await getEvents()).length;
  return { temps, all, events };
};
describe('adding new activities', () => {
  let allBefore: number;
  let eventsBefore: number;
  let tempsBefore: number;
  let userId: Types.ObjectId;

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  beforeEach(async () => {
    const user = await register({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });
    userId = user._id;
    await createTemplate({ start_time: time12, stop_time: time14, name: occupiedTemplateName, userId });
    await createEvent({ start_time: time12, stop_time: time14, date: now, name: occupiedEventName, userId });

    const { all, events, temps } = await getAllActivitiesKindsCounts();
    eventsBefore = events;
    tempsBefore = temps;
    allBefore = all;
  });
  it('should return proper ammount of different activitites from database', async () => {
    const { all, events, temps } = await getAllActivitiesKindsCounts();
    expect(events).toBe(1);
    expect(temps).toBe(1);
    expect(all).toBe(2);
  });
  describe('when successfully adding template', () => {
    it('activites quantity should be correct', async () => {
      await expect(
        createTemplate({ start_time: time12, stop_time: time14, name: templateName, userId })
      ).resolves.not.toThrow();

      const { all, events, temps } = await getAllActivitiesKindsCounts();

      expect(events).toEqual(eventsBefore);
      expect(temps).toEqual(tempsBefore + 1);
      expect(all).toEqual(allBefore + 1);
    });
  });
  describe('when successfully adding event', () => {
    it('quantity of stored documents should be correct', async () => {
      await expect(
        createEvent({ date: nextYear, start_time: time16, stop_time: time18, name: eventName, userId })
      ).resolves.not.toThrow();

      const { all, events, temps } = await getAllActivitiesKindsCounts();

      expect(events).toEqual(eventsBefore + 1);
      expect(temps).toEqual(tempsBefore);
      expect(all).toEqual(allBefore + 1);
    });
  });

  describe('when creating activities using uccupied name', () => {
    it('should not create any', async () => {
      await expect(
        createTemplate({ start_time: time16, stop_time: time18, name: occupiedTemplateName, userId })
      ).rejects.toThrow();
      await expect(
        createEvent({ start_time: time16, stop_time: time18, date: now, name: occupiedEventName, userId })
      ).rejects.toThrow();

      const { all, events, temps } = await getAllActivitiesKindsCounts();

      expect(events).toEqual(eventsBefore);
      expect(temps).toEqual(tempsBefore);
      expect(all).toEqual(allBefore);
    });
  });

  describe('when overlaps other event timespan', () => {
    it('should not let create event but let create template', async () => {
      await expect(
        createTemplate({ start_time: time12, stop_time: time18, name: templateName, userId })
      ).resolves.not.toThrow();
      await expect(
        createEvent({ date: now, start_time: time12, stop_time: time18, name: eventName, userId })
      ).rejects.toThrow();

      const { all, events, temps } = await getAllActivitiesKindsCounts();

      expect(events).toEqual(eventsBefore);
      expect(temps).toEqual(tempsBefore + 1);
      expect(all).toEqual(allBefore + 1);
    });
  });
});

describe('updating activities', () => {
  let allBefore: number;
  let eventsBefore: number;
  let tempsBefore: number;
  let templateId: Types.ObjectId;

  beforeEach(async () => {
    const artist = await registerArtist({ email: takenEmail, password: validPassword, passwordConfirm: validPassword });

    const template = await createTemplate({
      start_time: time12,
      stop_time: time14,
      name: occupiedTemplateName,
      userId: artist._id
    });
    templateId = template.id;

    const { all, events, temps } = await getAllActivitiesKindsCounts();
    eventsBefore = events;
    tempsBefore = temps;
    allBefore = all;
  });

  describe('when trying to add date info to template', () => {
    it('should not transition from template to event', async () => {
      await expect(updateActivity({ id: templateId, dataToUpdate: { date: now } })).rejects.toThrow();
      const { all, events, temps } = await getAllActivitiesKindsCounts();

      expect(events).toEqual(eventsBefore);
      expect(temps).toEqual(tempsBefore);
      expect(all).toEqual(allBefore);
    });
  });
})
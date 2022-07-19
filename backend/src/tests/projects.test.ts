import { Category, Project, Step } from 'src/models';
import { CategoryDocument } from 'src/models/categories';
import { ProjectDocument } from 'src/models/projects';
import { connectDB, clearDB, closeDB } from './db';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const firstCategoryName = 'first category';
const secondCategoryName = 'second category';
const firstProjectName = 'first project name';
const startDate = '';
const startDateAndTime = '2022-02-02 10:30';
const stopDateAndTime = '2022-02-02 15:30';
const startTimeInvalid = '13:200';
const startTime = '13:20';
const stopTimeInvalid = '16:200';
const stopTime = '16:20';
/**
 * Tworzenie stepu wyglada nastepujaco:
 * 0. bedac 'w projekcie' klikamy 'dodaj krok' przy uzyciu
 * funkcji addStep(date, startTime, stopTime, img?, used_materials?, description?)
 * 1.2 img jest tworzone zaraz po zuplaodowaniu zdjecia kroku
 * na serwer. Wsszystkie wartosci potrzebne do stworzenai Stepu sa generowane
 * 'samoistnie' oprocz img i used_materials
 * 2. tworzymy krok,
 * 3. tworzymy aktywnosc wykorzystujac startTime,
 * stopTime, date,
 * 4. do aktywnosci wpisujemy id kroku,
 * 5. do kroku wpisujemy id aktywnosci,
 * 6. zapisujemy krok i aktywnosc,
 */
describe('when addding new step', () => {
  beforeEach(async () => {
    const newCategoryName = 'new category';
    const newCategory = new Category({ name: newCategoryName });
    await newCategory.addProject(firstProjectName);
  });
  describe('when start time or  end time is invalid', () => {
    it('should not neither create nor add any new step', async () => {
      const now = new Date();
      let stepsAfter;
      const theProject: ProjectDocument | null = await Project.findOne();
      expect(theProject).toBeTruthy();
      const stepsBefore = await Step.find().count();

      await expect(theProject?.addStep({ date: now, startTime, stopTime: stopTimeInvalid })).rejects.toThrow();
      stepsAfter = await Step.find().count();
      expect(stepsAfter).toEqual(stepsBefore);
      await expect(theProject?.addStep({ date: now, startTime: startTimeInvalid, stopTime })).rejects.toThrow();
      stepsAfter = await Step.find().count();
      expect(stepsAfter).toEqual(stepsBefore);
      await expect(
        theProject?.addStep({ date: now, startTime: startTimeInvalid, stopTime: stopTimeInvalid })
      ).rejects.toThrow();
      stepsAfter = await Step.find().count();
      expect(stepsAfter).toEqual(stepsBefore);
    });
  });
});

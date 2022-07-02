/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
//would convert to 'export const preset' etc, like TS suggests, but it brokes ts-jest
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // moduleDirectories: ['node_modules', '.']
  moduleDirectories: ['node_modules', __dirname]
};

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node'
// };

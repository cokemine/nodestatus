/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testMatch: ['**/__tests__/**/?(*.)(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};

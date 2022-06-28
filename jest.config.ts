import type { Config } from '@jest/types';
const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts', 'json'], // nodemodules에서 확장자 없이 import된 파일이 있을 때 여기 있는 확장자만 넣어봄. 자주 사용하는 애들을 배열 앞쪽으로 넣어두면 빨리 찾음
  testMatch: ['<rootDir>/**/*.test.(js|ts)'],
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
};

export default config;

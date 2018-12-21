import * as fs from 'fs';

import {bifurcateLines, create} from './index';

describe('The parser', () => {
  it('can bifurcate the lines', () => {
    const lines = [
      '395.193526	396.609885	BCCH',
      '\\	3565.838135	12070.888672',
      '411.216082	412.647194	BCCH',
      '\\	3421.925049	9905.171875'
    ];
    const result = bifurcateLines(lines);
    const timeLine = result[0];
    const spectrogramLine = result[1];

    expect(timeLine[0]).toBe(lines[0]);
    expect(spectrogramLine[0]).toBe(lines[1]);
  });

  it('can handle returning result when there are no spectrogram lines', () => {
    const lines = [
      '395.193526	396.609885	BCCH',
      '411.216082	412.647194	BCCH',
    ];
    const result = bifurcateLines(lines);
    const timeLine = result[0];
    const spectrogramLine = result[1];

    expect(timeLine[0]).toBe(lines[0]);
    expect(timeLine[1]).toBe(lines[1]);
    expect(spectrogramLine).toEqual(['', '']);
  });

  it('handle a label file with spectrogram lines', () => {
    const labelsFile = fs.readFileSync('./assets/test-label-1.txt', 'utf8');
    const labels = create(labelsFile).join();
    const firstLabel = labels[0];
    const sixthLabel = labels[5];

    expect(firstLabel.endTime).toBe(396.609885);
    expect(firstLabel.frequencyCeiling).toBe(12070.888672);
    expect(sixthLabel.labelText).toBe('CAGO 3');
  });

  it('handle a label file without spectrogram lines', () => {
    const labelsFile = fs.readFileSync('./assets/test-label-2.txt', 'utf8');
    const labels = create(labelsFile).join();
    const firstLabel = labels[0];

    expect(firstLabel.endTime).toBe(396.609885);
    expect(firstLabel.labelText).toBe('BCCH');
  });

  it('handle a label file with a mix of labels with and without spectrographic selections',
     () => {
       const labelsFile = fs.readFileSync('./assets/test-label-3.txt', 'utf8');
       const labels = create(labelsFile).join();
       const thirdLabel = labels[2];
       const fourthLabel = labels[3];

       expect(thirdLabel.endTime).toBe(509.254646);
       expect(thirdLabel.labelText).toBe('WBNU');
       expect(thirdLabel.frequencyCeiling).toBe(0);

       expect(fourthLabel.endTime).toBe(523.034634);
       expect(fourthLabel.frequencyCeiling).toBe(2481.530518);
       expect(fourthLabel.labelText).toBe('AMCR');
     });

  it('should not treat the last empty line as a label', () => {
    const labelsFile = fs.readFileSync('./assets/test-label-3.txt', 'utf8');
    const labels = create(labelsFile).join();
    const sixthLabel = labels[5];

    expect(sixthLabel).toBe(undefined);
  });
});

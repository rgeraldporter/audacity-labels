import * as R from 'ramda';
import {Maybe} from 'simple-maybe';
import {Label} from './audacity-labels';

const items = {
  startTime: 0,
  endTime: 1,
  labelText: 2,
  frequencyFloor: 4,
  frequencyCeiling: 5
};

const splitLines = (data: string): string[] => data.split('\n');

const appendLabel =
    (arr: any[], str1: string,
     str2 = '') => [arr[0].concat([str1]), arr[1].concat([str2])];

const nextLine = (line: string, lines: string[]): string =>
    lines[lines.indexOf(line) + 1] || '';

const bifurcateLines = (lines: string[]): any =>
    lines.filter(line => !line.startsWith('\\') && line.length > 0)
        .reduce(
            (acc: any, cur: string, index: number): any[] =>
                nextLine(cur, lines).startsWith('\\') ?
                appendLabel(acc, cur, nextLine(cur, lines)) :
                appendLabel(acc, cur),
            [[], []]);

const patchLabels = (lines: any[]) => lines[0].map(
    (line: string, index: number) => line + '\t' + lines[1][index]);

const lineArr = R.memoizeWith(R.identity, (line: string) => line.split('\t'));

const getLineItem = (line: string, itemNumber: number) =>
    Maybe.of(lineArr(line))
        .map((arr: any[]): any[] => arr[itemNumber])
        .fork(() => '', (result: any) => result);

const stringToObj = (lines: any[]): {} => lines.map(
    (line: string): {} => ({
      startTime: Number(getLineItem(line, items.startTime)),
      endTime: Number(getLineItem(line, items.endTime)),
      labelText: String(getLineItem(line, items.labelText)),
      frequencyFloor: Number(getLineItem(line, items.frequencyFloor)),
      frequencyCeiling: Number(getLineItem(line, items.frequencyCeiling))
    }));

const lineOne = (label: Label) => `${label.startTime.toFixed(6)}\t${
    label.endTime.toFixed(6)}\t${label.labelText}\n`;
const lineTwo = (label: Label) => `\\\t${label.frequencyFloor.toFixed(6)}\t${
    label.frequencyCeiling.toFixed(6)}\n`;

const lineItem = (label: Label) =>
    label.frequencyFloor || label.frequencyCeiling ?
    lineOne(label) + lineTwo(label) :
    lineOne(label);

const labelsToString = (label: Label[]) =>
    label.reduce((acc: string, cur: Label) => acc + lineItem(cur), ``);

const fuseSpectrograms = R.pipe(bifurcateLines, patchLabels, stringToObj);

const parse = (data: string): any =>
    Maybe.of(data).map(splitLines).map(fuseSpectrograms);

const stringify = (labels: Label[]) => Maybe.of(labels).map(labelsToString);

export {parse, stringify, bifurcateLines};

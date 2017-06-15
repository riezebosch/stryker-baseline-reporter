import BaselineReporter from '../src/BaselineReporter';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import { expect } from 'chai';
import * as fs from 'mz/fs';
const tempy = require('tempy');

describe('BaselineReporter', () => {
    describe('compare', () => {
        it('returns true when mutant consists in baseline', () => {
            let sut = new BaselineReporter();
            let mutant: MutantResult = baseline();

            expect(sut.compare(baseline(), mutant)).to.be.true;
        });

        it('returns false when mutatedLines differs', () => {
            let sut = new BaselineReporter();
            let mutant = baseline();
            mutant.mutatedLines = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when originalLines differs', () => {
            let sut = new BaselineReporter();
            let mutant = baseline();
            mutant.originalLines = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when mutator differs', () => {
            let sut = new BaselineReporter();
            let mutant = baseline();
            mutant.mutatorName = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when source file differs', () => {
            let sut = new BaselineReporter();
            let mutant = baseline();
            mutant.sourceFilePath = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });
    });

    describe('save', () => {
        let tmp: string;

        beforeEach(() => {
            tmp = tempy.file({ ext: '.json' });
        });

        afterEach(async () => {
            if (await fs.exists(tmp)) {
                await fs.unlink(tmp);
            }
        });

        it('stores in a json file', async () => {
            let sut = new BaselineReporter();

            await sut.save([], tmp);
            expect(await fs.exists(tmp)).to.be.true;
        });

        it('stores all received mutant results', async () => {
            let sut = new BaselineReporter();

            await sut.save([baseline()], tmp);
            expect(await fs.exists(tmp)).to.be.true;

            let data = await fs.readFile(tmp, 'utf-8');
            expect(data).to.match(/mutatedLines/g);
        });

        it('filters surviving mutants', async () => {
            let killed = baseline();
            killed.status = MutantStatus.Killed;

            let sut = new BaselineReporter();

            await sut.save([baseline(), killed], tmp);
            expect(await fs.exists(tmp)).to.be.true;

            let data = await fs.readFile(tmp, 'utf-8');
            expect(data).to.not.match(/"status":[^2]/g);
        });
    })
});

function baseline(): MutantResult {
    return {
        location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        mutatedLines: '',
        mutatorName: '',
        originalLines: '',
        replacement: '',
        sourceFilePath: '',
        testsRan: [''],
        status: MutantStatus.Survived,
        range: [0, 0]
    }
}
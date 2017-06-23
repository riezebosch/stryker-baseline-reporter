import BaselineReporter from '../src/BaselineReporter';
import { read } from '../src/BaselineReporter';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import { expect } from 'chai';
import * as fs from 'mz/fs';
import * as sinon from "Sinon";
import * as path from 'path';

describe('BaselineReporter', () => {
    describe('compare', () => {
        it('returns true when mutant consists in baseline', () => {
            let sut = new BaselineReporter(undefined, []);
            let mutant: MutantResult = baseline();

            expect(sut.compare(baseline(), mutant)).to.be.true;
        });

        it('returns false when mutatedLines differs', () => {
            let sut = new BaselineReporter(undefined, []);
            let mutant = baseline();
            mutant.mutatedLines = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when originalLines differs', () => {
            let sut = new BaselineReporter(undefined, []);
            let mutant = baseline();
            mutant.originalLines = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when mutator differs', () => {
            let sut = new BaselineReporter(undefined, []);
            let mutant = baseline();
            mutant.mutatorName = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });

        it('returns false when source file differs', () => {
            let sut = new BaselineReporter(undefined, []);
            let mutant = baseline();
            mutant.sourceFilePath = 'asdf';

            expect(sut.compare(baseline(), mutant)).to.be.false;
        });
    });

    describe('onAllMutantsTested', () => {
        it('when no new mutants survived', () => {
            let write = sinon.spy();

            let sut = new BaselineReporter(undefined, [baseline()], write);
            sut.onAllMutantsTested([baseline()]);

            sinon.assert.calledWithMatch(write, /Good job!/);
        });

        it('when you killed some mutants', () => {
            let write = sinon.spy();

            let sut = new BaselineReporter(undefined, [baseline()], write);
            sut.onAllMutantsTested([]);

            sinon.assert.calledWithMatch(write, /Great job!/);
        });

        it('reports new surviving mutants', () => {
            let write = sinon.spy();
            let sut = new BaselineReporter(undefined, [], write);

            sut.onAllMutantsTested([baseline()]);

            sinon.assert.calledWithMatch(write, /Shame on you!/);
        });

        it('only compares surviving mutants', () => {
            let write = sinon.spy();
            let sut = new BaselineReporter(undefined, [], write);

            let result = baseline();
            result.status = MutantStatus.Killed;

            sut.onAllMutantsTested([result]);

            sinon.assert.calledWithMatch(write, /Good job/);
        });

        it('when you killed some and created some', () => {
            let write = sinon.spy();
            let sut = new BaselineReporter(undefined, [baseline()], write);

            let result = baseline();
            result.mutatedLines = result.mutatedLines + 'asdf';

            sut.onAllMutantsTested([result]);
            sinon.assert.calledWithMatch(write, /Mixed feelings/);
        });
    });

    describe('wrapUp()', () => {
        it('saves the new list', async () => {
            let write = sinon.spy();
            let sut = new BaselineReporter(undefined, [], write);

            let mutant = baseline();
            sut.onAllMutantsTested([mutant]);

            await sut.wrapUp();
            sinon.assert.calledWithMatch(write, /Saved a new/);
        });

        it('saves the new list', async () => {
            let sut = new BaselineReporter(undefined, [], (_) => { });

            let mutant = baseline();
            sut.onAllMutantsTested([mutant]);

            await sut.wrapUp();

            expect(await (fs.exists(sut.filename))).to.true;
        });
    });

    describe('read', () => {
        expect(read(path.join(__dirname, 'test.baseline.js'))).to.not.empty;
    });
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
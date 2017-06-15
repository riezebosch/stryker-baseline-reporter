import BaselineReporter from '../src/BaselineReporter';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import { expect } from 'chai';

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
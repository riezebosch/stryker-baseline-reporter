import { MutantResult, Reporter, MutantStatus } from 'stryker-api/report';

import * as fs from 'mz/fs';
import * as chalk from 'chalk';
import { StrykerOptions } from 'stryker-api/core';
import * as _ from 'lodash';
const tempy = require('tempy');
import * as path from 'path';

export default class implements Reporter {
    surviving: MutantResult[];
    public filename = path.join(tempy.directory(), 'stryker.baseline.js');

    constructor(_?: StrykerOptions,
        private baseline: MutantResult[] | undefined = read(),
        private write: (data: string) => void = console.log) {
    }

    public onAllMutantsTested(results: MutantResult[]): void {
        this.surviving = results.filter(_ => _.status === MutantStatus.Survived || _.status === MutantStatus.NoCoverage);

        if (!this.baseline) {
            this.ReportWithNoBaselineFile(this.surviving);
        } else {
            this.ReportDifferenceWithBaseline(this.surviving, this.baseline);
        }
    }

    public async wrapUp(): Promise<void> {
        this.write(`Saved a new baseline file: ${this.filename}`);
        await fs.writeFile(this.filename, JSON.stringify(this.surviving));
    }

    public compare(lhs: MutantResult, rhs: MutantResult) {
        return lhs.mutatedLines === rhs.mutatedLines
            && lhs.originalLines === rhs.originalLines
            && lhs.mutatorName === rhs.mutatorName
            && lhs.sourceFilePath === rhs.sourceFilePath;
    }

    private ReportWithNoBaselineFile(surviving: MutantResult[]) {
        if (surviving.length > 0) {
            this.write(chalk.yellow(chalk.bold('No hard feelings.'), 'Mutants survived but it may be it is not your fault after all.'));
            this.write('There was no baseline. Mind though that including a baseline file at this point will let the mutants live on forever...');
            this.write('Overwrite your baseline file with the one mentioned at the end of this log.');
        } else {
            this.write(chalk.yellow(chalk.green('You guys rock!'), 'No surviving mutants at all.'));
            this.write('Who needs a baseline file anyway.');
        }
    }

    private ReportDifferenceWithBaseline(surviving: MutantResult[], baseline: MutantResult[]) {
        let fresh = _.differenceWith(surviving, this.baseline, (lhs: MutantResult, rhs: MutantResult) => this.compare(lhs, rhs));

        if (fresh.length === 0) {
            this.ReportNoNewSurvivingMutants(surviving, baseline);
        } else {
            this.ReportNewSurvivingMutants(surviving, baseline);
        }
    }

    private ReportNoNewSurvivingMutants(surviving: MutantResult[], baseline: MutantResult[]) {
        if (surviving.length === baseline.length) {
            this.write(chalk.green(chalk.bold('Good job!'), 'At least you did not introduce new mutants.'));
        } else {
            this.write(chalk.green(chalk.bold('Great job!'), 'You killed some mutants that someone other than you created.'));
            this.write('You should update the baseline file right now!');
            this.write('Go ahead, overwrite your baseline file with the one mentioned at the end of this log.');
        }
    }

    private ReportNewSurvivingMutants(surviving: MutantResult[], baseline: MutantResult[]) {
        let gone = _.differenceWith(baseline, surviving, (lhs: MutantResult, rhs: MutantResult) => this.compare(lhs, rhs));
        if (gone.length === 0) {
            this.write(chalk.red(chalk.bold('Shame on you!'), 'New mutants survived. Let\'s go kill them!'));
            this.write('If you just can\'t fix them you should update the baseline file now.');
        } else {
            this.write(chalk.yellow(chalk.bold('Mixed feelings.'), 'You killed some mutants but also introduced some.'));
            this.write('Mind that updating the baseline file will let them live forever...');
        }

        this.write('Overwrite your baseline file with the one mentioned at the end of this log.');
    }
}

export function read(filename = 'stryker.baseline.js'): MutantResult[] | undefined {
    return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf-8')) : undefined;
}
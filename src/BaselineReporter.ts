import { MutantResult, Reporter, MutantStatus } from "stryker-api/report";

import * as fs from 'mz/fs';
import * as chalk from 'chalk';
import { StrykerOptions } from "stryker-api/core";
import * as _ from "lodash";
const tempy = require('tempy');
import * as path from 'path';

export default class implements Reporter {
    surviving: MutantResult[];
    public filename = path.join(tempy.directory(), 'stryker.baseline.js');

    constructor(_?: StrykerOptions,
        private baseline: MutantResult[] = read(),
        private write: (data: string) => void = console.log) {
    }

    public onAllMutantsTested(results: MutantResult[]): void {
        this.surviving = results.filter(_ => _.status == MutantStatus.Survived);

        let fresh = _.differenceWith(this.surviving, this.baseline, (lhs: MutantResult, rhs: MutantResult) => this.compare(lhs, rhs));
        let gone = _.differenceWith(this.baseline, this.surviving, (lhs: MutantResult, rhs: MutantResult) => this.compare(lhs, rhs));

        if (fresh.length == 0) {
            if (this.surviving.length == this.baseline.length) {
                this.write(chalk.green(chalk.bold('Good job!'), 'At least you did not introduce new mutants.'));
            } else {
                this.write(chalk.green(chalk.bold('Great job!'), 'You killed some mutants that someone other than you created.'));
                this.write('You should update the baseline file right now!');
            }
        } else {
            fresh.forEach(_ => this.write(_.sourceFilePath));
            if (gone.length == 0) {
                this.write(chalk.red(chalk.bold('Shame on you!'), 'New mutants survived. Let\'s go kill them!'));
                this.write('If it wasn\'t your fault or you just can\'t fix them you should update the baseline file.');
            } else {
                this.write(chalk.yellow(chalk.bold('Mixed feelings.'), 'You killed some mutants but also introduced some.'));
                this.write('Mind updating the baseline file will let them live forever...')
            }
        }
    }

    public async wrapUp(): Promise<void> {
        this.write(`Saved a new baseline file: ${this.filename}`)
        await fs.writeFile(this.filename, JSON.stringify(this.surviving));
    }

    public compare(lhs: MutantResult, rhs: MutantResult) {
        return lhs.mutatedLines == rhs.mutatedLines
            && lhs.originalLines == rhs.originalLines
            && lhs.mutatorName == rhs.mutatorName
            && lhs.sourceFilePath == rhs.sourceFilePath;
    }
}

export function read(filename = 'stryker.baseline.js'): MutantResult[] {
    return JSON.parse(fs.readFileSync(filename, 'utf-8'));
}
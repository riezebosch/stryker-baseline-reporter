import { MutantResult, Reporter, MutantStatus } from "stryker-api/report";

import * as fs from 'mz/fs';
import * as chalk from 'chalk';
import { StrykerOptions } from "stryker-api/core";
import * as _ from "lodash";

export default class implements Reporter {
    constructor(_?: StrykerOptions,
         private baseline: MutantResult[] = [],
        private write: (data: string) => void = console.log) {
    }

    public onAllMutantsTested(results: MutantResult[]): void {
        results = results.filter(_ => _.status == MutantStatus.Survived);

        let fresh = _(results).difference(this.baseline);
        let old = _(this.baseline).difference(results);

        if (fresh.isEmpty()) {
            if (results.length == this.baseline.length) {
                this.write(chalk.green(chalk.bold('Good job!'), 'At least you did not introduce new mutants.'));
            } else {
                this.write(chalk.green(chalk.bold('Great job!'), 'You killed some mutants that someone other than you created.'));
            }
        } else {
            if (old.isEmpty()) {
                this.write(chalk.red(chalk.bold('Shame on you!'), 'New mutants survived. Let\'s go kill them!'));
            } else {
                this.write(chalk.yellow(chalk.bold('Mixed feelings.'), 'You killed some mutants but also introduced some.'));
            }
        }
    }

    public async save(results: MutantResult[], file: string) {
        await fs.writeFile(file, JSON.stringify(results.filter(_ => _.status == MutantStatus.Survived)));
    }

    public compare(lhs: MutantResult, rhs: MutantResult) {
        return lhs.mutatedLines == rhs.mutatedLines
            && lhs.originalLines == rhs.originalLines
            && lhs.mutatorName == rhs.mutatorName
            && lhs.sourceFilePath == rhs.sourceFilePath;
    }
}
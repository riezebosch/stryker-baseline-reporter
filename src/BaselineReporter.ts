import { MutantResult, Reporter, MutantStatus } from "stryker-api/report";
import * as fs from 'mz/fs';

export default class implements Reporter {
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
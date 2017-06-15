import { MutantResult, Reporter } from "stryker-api/report";

export default class implements Reporter {
    public compare(lhs: MutantResult, rhs: MutantResult) {
        return lhs.mutatedLines == rhs.mutatedLines
            && lhs.originalLines == rhs.originalLines
            && lhs.mutatorName == rhs.mutatorName
            && lhs.sourceFilePath == rhs.sourceFilePath;
    }
}
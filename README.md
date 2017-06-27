> A *baseline* reporter for the excellent JavaScript mutation testing framework [Stryker](http://stryker-mutator.github.io/).

It's just that. 

Store a baseline file after a test run and this reporter tells when there are new mutants on subsequent run.

## Installation
```
npm i --save-dev stryker-baseline-reporter
```

stryker.conf.js:
```js
module.exports = function (config) {
    config.set({
        reporter: ['clear-text', 'progress', 'baseline'],
    });
}
```

Run!

## Note!
As of writing there is [an issue](https://github.com/stryker-mutator/stryker/issues/291) with stryker where test runs *can be* inconsistent. Of course this is terrible for this reporter because it will impact the outcome.
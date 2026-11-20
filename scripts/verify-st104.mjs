// Optional independent mathematical check. Uses installed Vite and Python stdlib.
import { createServer } from "vite";
import { spawnSync } from "node:child_process";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const records = [];
try {
  const { generateInterpretationTask, assessInterpretationAnswer } = await server.ssrLoadModule("/src/statistics/interpretationTasks.ts");
  for (const difficulty of ["easy", "medium", "hard"]) {
    for (const seed of [...Array.from({ length: 256 }, (_, i) => i), 0xffffffff]) {
      const task = generateInterpretationTask(difficulty, seed);
      records.push({ ...task, assessments: task.options.map(option => ({ option, result: assessInterpretationAnswer(task, option) })) });
    }
  }
} finally {
  await server.close();
}

const oracle = `
import json, sys
from fractions import Fraction

def require(condition, label):
    if not condition:
        raise AssertionError(label)

def check_fraction(actual, expected, label):
    require((int(actual['numerator']), int(actual['denominator'])) ==
            (expected.numerator, expected.denominator), label)

def snapshot(data):
    values = data['values']
    n = len(values)
    ordered = sorted(values)
    mean = Fraction(sum(values), n)
    median = (Fraction(ordered[(n-1)//2]) + Fraction(ordered[n//2])) / 2
    check_fraction(data['mean'], mean, 'mean')
    check_fraction(data['median'], median, 'median')
    return mean, median

records = json.load(sys.stdin)
counts = {level: 0 for level in ['easy', 'medium', 'hard']}
displayed = {level: set() for level in counts}
scenarios = {level: set() for level in counts}
for record in records:
    label = record['id']
    before_mean, before_median = snapshot(record['original'])
    if record['kind'] == 'compare-centres':
        expected = ('mean-below-median' if before_mean < before_median else
                    'mean-above-median' if before_mean > before_median else 'mean-equals-median')
        options = {'mean-below-median', 'mean-above-median', 'mean-equals-median'}
    else:
        values = record['original']['values'].copy()
        replacement = record['replacement']
        require(values[replacement['index']] == replacement['from'], label + ' replacement source')
        values[replacement['index']] = replacement['to']
        require(values == record['modified']['values'], label + ' one replacement')
        after_mean, after_median = snapshot(record['modified'])
        mean_change, median_change = abs(after_mean-before_mean), abs(after_median-before_median)
        check_fraction(record['absoluteChange']['mean'], mean_change, label + ' mean change')
        check_fraction(record['absoluteChange']['median'], median_change, label + ' median change')
        expected = ('mean-changes-less' if mean_change < median_change else
                    'median-changes-less' if median_change < mean_change else 'equal-change')
        options = {'mean-changes-less', 'median-changes-less', 'equal-change'}
    require(record['answer'] == expected, label + ' answer')
    require(set(record['options']) == options and len(record['options']) == 3, label + ' options')
    for assessment in record['assessments']:
        require(assessment['result'] == ('correct' if assessment['option'] == expected else 'incorrect'), label + ' assessment')
    question = {'kind':record['kind'], 'values':record['original']['values']}
    scenario = {'kind':record['kind'], 'values':sorted(record['original']['values'])}
    if record['kind'] == 'compare-changes':
        question['replacement'] = record['replacement']
        scenario['replacement'] = {key:record['replacement'][key] for key in ['from', 'to']}
    displayed[record['difficulty']].add(json.dumps(question, sort_keys=True))
    scenarios[record['difficulty']].add(json.dumps(scenario, sort_keys=True))
    counts[record['difficulty']] += 1
require(counts == {'easy':257, 'medium':257, 'hard':257}, 'coverage')
print(json.dumps({'requests':len(records), 'passed':len(records), 'failed':0,
                  'perLevel':counts, 'gradedChoices':3*len(records),
                  'uniqueDisplayedQuestions':{key:len(value) for key,value in displayed.items()},
                  'uniqueMathematicalScenarios':{key:len(value) for key,value in scenarios.items()},
                  'oracle':'Python Fraction; independently sorted central observations'}))
`;
const result = spawnSync("python3", ["-c", oracle], {
  input: JSON.stringify(records, (_, value) => typeof value === "bigint" ? value.toString() : value),
  encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;

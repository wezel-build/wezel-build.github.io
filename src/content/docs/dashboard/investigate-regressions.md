---
title: Investigate regressions
description: See how Wezel detects a regression and finds the commits that introduced it.
---

A measurement changing is not automatically a regression. Wezel considers the
summary's direction, recent measured history, and the project's detection
threshold before recording a wrong-way move that needs attention.

For example, an increase in `binary-size` is a regression because the filesize
executor reports that lower values are better. The same numerical increase
could be an improvement for a summary whose higher values are better.

## From detection to a suspect range

When a scheduled run crosses the detection threshold, Wezel records:

- the affected experiment and summary;
- the closest prior measured commit as the baseline;
- the commit where the regression was detected;
- the values at both ends; and
- the platform that produced them.

Those two measured commits form a suspect range. Any unmeasured commits between
them may have introduced part of the change.

```text
measured good                                      measured bad
     │                                                   │
     ▼                                                   ▼
  commit A ── commit B ── commit C ── commit D ── commit E
                 └──────────── suspect range ────────────┘
```

In the C example, if Wezel measured the small executable at commit A and the
larger executable at commit E, the commit that added the 64 KiB payload would
be somewhere in that range.

## How the regression hunt works

Wezel queues the experiment at a commit near the middle of the suspect range.
The result tells it which half still contains the wrong-way change. It repeats
the process until adjacent measured commits isolate a culprit.

```text
A good ─────────────── E bad
          test C

A good ── C good ───── E bad
                   test D

C good ── D bad
           ▲
        culprit
```

This is why routine scheduling does not need to measure every commit in
advance. Wezel spends the extra runner time only after a meaningful change
appears. If several commits contributed separate regressions, a hunt can
identify more than one culprit.

Automatic hunting is enabled by default. Set `bisect = false` on a summary when
you want its regressions recorded without spending runner time to locate their
culprits.

## Review a regression

From a project page, open the command palette and select **View regressions**.
Then select an open regression. Its detail page shows:

- the baseline and detected values;
- every commit in the suspect range;
- measurements and good or bad verdicts gathered by the hunt;
- identified culprit commits; and
- the threshold and direction used for detection.

The experiment page also links directly to an open regression from the affected
output.

After you have addressed or accepted the change, select **Mark resolved**.
Wezel does not close regressions automatically: resolution records your team's
decision, not merely another movement in the metric.

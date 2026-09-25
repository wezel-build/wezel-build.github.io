---
title: Notifications
description: Send important Wezel events to the channels your team already watches.
---

The Dashboard records every run, but a team should not have to watch it
continuously. Notifications bring the events that require attention to Slack,
Discord, or another webhook endpoint.

Notification setup has two parts: a workspace administrator adds a reusable
channel, then each project chooses which experiment events go to that channel.

## Add a channel

Open the command palette and select **Manage notification channels**. Add a
channel with a name, kind, and webhook URL.

The supported channel kinds are:

- **Slack** for a Slack incoming webhook;
- **Discord** for a Discord webhook; and
- **Generic** for an HTTPS endpoint that accepts Wezel webhook payloads.

After adding the channel, select **Test**. Confirm that the test reaches the
destination before routing project events to it.

Channels belong to the workspace, so several projects can reuse a destination
such as `#performance-alerts` without storing its webhook URL separately for
each project.

## Route project events

From a project page, open the command palette and select **Configure
notifications**. The routing table has one row for each experiment and channel.
Enable only the events that destination should receive:

- **Regression** when an experiment summary crosses its detection threshold;
- **Culprit found** when a regression hunt isolates a commit; and
- **Run failed** when an experiment does not complete successfully.

Routes are explicit. An unticked event is not sent, and adding a channel does
not subscribe every project automatically.

For example, you might send regressions and culprits from
`example-experiment` to the team's performance channel, while sending failed
runs to a broader engineering channel. This keeps measurement history in the
Dashboard and directs only actionable changes to the people who need them.

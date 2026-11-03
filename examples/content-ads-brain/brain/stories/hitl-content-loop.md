# HITL article and LinkedIn loop

## Problem

Teams let a model write posts from a landing page. The post invents a price, a feature, or a promise. Google treats scaled low-quality content as spam. Boosting that post spends money on a lie.

## What we built

A git brain the workers must read, an article worker that only writes `pending`, a human approve/reject gate, and a LinkedIn worker that may run only after the article is `published`. Instagram and ads are later formats of the same text.

## How we know it works

The OSS path is checkable today: `brain validate` and `node workers/run.mjs article`. LinkedIn is not posted by the worker. Proof of the full loop is a human marking `approved` and a slug on agentkbase.com/blog. First live piece: `/blog/stop-fake-prices`.

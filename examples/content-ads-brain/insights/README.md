# Insights (local)

Drop one JSON file per published Instagram item. Same id as the queue file.

`insights/ig-d01.json`

```json
{
  "saves": 12,
  "shares": 3,
  "retention_s": 7,
  "winner": true
}
```

The ads worker only drafts if `winner` is true or `saves` is at least 10. It never launches a campaign.

# Your agent invented the price

The model is fluent. Fluency is not a fact. If the price, the pack, or the promise is not written down somewhere the agent must read, it will fill the gap. That sentence will look finished. It will still be wrong.

This article is the first public piece of Agent KBase’s own content loop. A worker drafted it from the project brain. A human still has to mark it `approved` before it goes on the site. Nothing here is a traffic guarantee.

## The failure mode

A founder asks an agent to “write a post about our plans”. The landing page says “from €99” in one place and “quoted retainer” in another. The model averages them. The post ships with a number nobody will honour.

Skills and MCP tools do not stop that. They say what the agent **can do** (fetch a URL, open a file, call an API). They do not say what is **true**. Agent KBase’s public MCP is read-only on purpose: `brain_brief`, `brain_validate`, `brain_read`. It does not publish. Publishing is a later step, after a person says yes.

## What the loop actually does

1. **Brain.** Facts live in git: offer, voice, what not to claim, open questions marked `[CONFIRM]`.
2. **Article worker.** Reads that brain, opens the next item on the slate, writes a draft into `pending`.
3. **Human.** Approve or reject. No silent publish.
4. **Distribution worker.** Only after the article is `published`. It drafts a LinkedIn post from the approved text. It does not invent a second offer.

Instagram Reels and ads are optional later formats of the same approved piece. They are not the first product. Video is slower to test. A markdown article is cheap to run and easy to review.

## Quality is the product

Google’s spam policies treat scaled, unoriginal content as a problem. A pipeline that emits twenty posts a day with no sources and no editor is not a business. It is a way to get ignored.

The gate we will not skip:

* Every draft cites the brain files it used.
* Claims that are not in `facts/` stay `[CONFIRM]` or get cut.
* A human reads the piece before it is public.
* Distribution cannot run on a rejected or pending article.

If that gate feels slow, it is working.

## Who this is for

Not a marketing department with an agency. Not someone with no site and no offer.

A founder-led company that already has a website and no one whose job is “make sure the agent did not invent the price”.

## Try the boring part

The OSS brain is free. The wizard and CLI export a `brain/` folder. The workers that write and distribute are the paid layer, and they are not in the public MCP.

If you want the operated loop, that is [content and ads workers](/company-brain) (the name is lagging the blog-first loop; the waitlist is the same door).

## Sources used for this draft

* `brain/facts/project.md`
* `brain/facts/brand-guardrails.md`
* `brain/facts/connectors.md`
* `docs/10-mcp.md` (read-only MCP)
* `docs/11-content-ads-workers.md` (HITL, no virality promise)

No client metrics. No invented rankings. No invoice ask.

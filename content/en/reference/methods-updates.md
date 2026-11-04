---
title: Methods: updates & bot
lead: Receiving updates, webhooks, bot info and review requests.
---

To build a bot you usually do not call these directly: `start_polling` and `SimpleRequestHandler` manage them. ([Running: polling & webhook](/guide/running))

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`get_updates`](/reference/methods-updates?s=get_updates) | `getUpdates` | Fetches updates with long polling. |
| [`set_webhook`](/reference/methods-updates?s=set_webhook) | `setWebhook` | Sets the webhook address. |
| [`delete_webhook`](/reference/methods-updates?s=delete_webhook) | `deleteWebhook` | Deletes the webhook (needed to return to polling). |
| [`get_webhook_info`](/reference/methods-updates?s=get_webhook_info) | `getWebhookInfo` | Returns the current webhook state (an empty `url` means none). |
| [`get_me`](/reference/methods-updates?s=get_me) | `getMe` | Information about the bot itself (id, name, username). |
| [`ask_review`](/reference/methods-updates?s=ask_review) | `askReview` | After some seconds, asks the user to rate and review the bot. |

::: method
## get_updates {#get_updates}
::: head getUpdates | list[Update]
:::
::: sig
await bot.get_updates(offset=None, limit=None, timeout=None)
:::

Fetches updates with long polling. You rarely call it yourself; `start_polling` does it.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `offset` | `int` | {opt} | Id of the first update; pass the last `update_id` + 1 to acknowledge earlier ones |
| `limit` | `int` | {opt} | 1 to 100 (default 100) |
| `timeout` | `int` | {opt} | Long-polling seconds |

**Returns:** `list[Update]`

#### Example

```python
updates = await bot.get_updates(timeout=0)
for update in updates:
    print(update.update_id, update.event_type)
```

::: note
Bale keeps the last 2000 updates for 24 hours. It cannot be used together with a webhook.
:::

:::

::: method
## set_webhook {#set_webhook}
::: head setWebhook | bool
:::
::: sig
await bot.set_webhook(url)
:::

Sets the webhook address. HTTPS only, port 443 or 88.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | `str` | {req} | An HTTPS address; an empty string disables it |

**Returns:** `bool`

#### Example

```python
await bot.set_webhook("https://bot.example.com/webhook/secret-path")
```

::: danger
Bale sends no secret header; make the path unguessable (`secret_path()`).
:::

:::

::: method
## delete_webhook {#delete_webhook}
::: head deleteWebhook | bool
:::
::: sig
await bot.delete_webhook()
:::

Deletes the webhook (needed to return to polling).

#### Parameters

This method has no parameters.

**Returns:** `bool`

#### Example

```python
await bot.delete_webhook()
```

:::

::: method
## get_webhook_info {#get_webhook_info}
::: head getWebhookInfo | WebhookInfo
:::
::: sig
await bot.get_webhook_info()
:::

Returns the current webhook state (an empty `url` means none).

#### Parameters

This method has no parameters.

**Returns:** `WebhookInfo`

#### Example

```python
info = await bot.get_webhook_info()
print(info.url or "no webhook")
```

:::

::: method
## get_me {#get_me}
::: head getMe | User
:::
::: sig
await bot.get_me()      # or  await bot.me()   # cached
:::

Information about the bot itself (id, name, username).

#### Parameters

This method has no parameters.

**Returns:** `User`

#### Example

```python
me = await bot.me()
print(f"@{me.username} ({me.id})")
```

::: tip
`bot.me()` caches the result and makes the request only once.
:::

:::

::: method
## ask_review {#ask_review}
::: head askReview | bool
:::
::: sig
await bot.ask_review(user_id, delay_seconds)
:::

After some seconds, asks the user to rate and review the bot.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | `int` | {req} | Numeric user id |
| `delay_seconds` | `int` | {req} | Show the request after this many seconds |

**Returns:** `bool`

#### Example

```python
await bot.ask_review(12345, delay_seconds=30)
```

::: note
This feature is available in new Bale versions since Aban 1404 (Oct-Nov 2025).
:::

:::

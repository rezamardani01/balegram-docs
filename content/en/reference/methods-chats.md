---
title: Methods: chats & groups
lead: Chat info, member management, group settings, pins and invite links.
---

Most methods on this page are **for groups and channels only** and return `unsupported peer type` on a private chat. To manage (ban, pin, change title...) the bot must be an **admin**.

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`get_chat`](/reference/methods-chats?s=get_chat) | `getChat` | Full information about a chat: title, description, invite link, photo, ... |
| [`get_chat_administrators`](/reference/methods-chats?s=get_chat_administrators) | `getChatAdministrators` | The list of administrators of a group or channel. |
| [`get_chat_members_count`](/reference/methods-chats?s=get_chat_members_count) | `getChatMembersCount` | The number of members of a group or channel. |
| [`get_chat_member`](/reference/methods-chats?s=get_chat_member) | `getChatMember` | Information and status of a member (`creator`, `administrator`, `member`, `restricted`...). |
| [`ban_chat_member`](/reference/methods-chats?s=ban_chat_member) | `banChatMember` | Removes and bans a user from a group or channel. |
| [`unban_chat_member`](/reference/methods-chats?s=unban_chat_member) | `unbanChatMember` | Lifts a user's ban. |
| [`promote_chat_member`](/reference/methods-chats?s=promote_chat_member) | `promoteChatMember` | Makes a user an admin or changes admin rights. |
| [`leave_chat`](/reference/methods-chats?s=leave_chat) | `leaveChat` | The bot leaves a group or channel. |
| [`set_chat_photo`](/reference/methods-chats?s=set_chat_photo) | `setChatPhoto` | Changes the photo of a group or channel. |
| [`delete_chat_photo`](/reference/methods-chats?s=delete_chat_photo) | `deleteChatPhoto` | Deletes the photo of a group or channel. |
| [`set_chat_title`](/reference/methods-chats?s=set_chat_title) | `setChatTitle` | Changes the title of a group or channel. |
| [`set_chat_description`](/reference/methods-chats?s=set_chat_description) | `setChatDescription` | Changes the description of a group or channel. |
| [`pin_chat_message`](/reference/methods-chats?s=pin_chat_message) | `pinChatMessage` | Pins a message in the chat. |
| [`unpin_chat_message`](/reference/methods-chats?s=unpin_chat_message) | `unpinChatMessage` | Unpins a message. |
| [`unpin_all_chat_messages`](/reference/methods-chats?s=unpin_all_chat_messages) | `unpinAllChatMessages` | Unpins all messages of the chat. |
| [`create_chat_invite_link`](/reference/methods-chats?s=create_chat_invite_link) | `createChatInviteLink` | Creates a new invite link for a group or channel. |
| [`revoke_chat_invite_link`](/reference/methods-chats?s=revoke_chat_invite_link) | `revokeChatInviteLink` | Revokes an invite link and returns a new one. |
| [`export_chat_invite_link`](/reference/methods-chats?s=export_chat_invite_link) | `exportChatInviteLink` | Returns the chat's main invite link. |

::: method
## get_chat {#get_chat}
::: head getChat | ChatFullInfo
:::
::: sig
await bot.get_chat(chat_id)
:::

Full information about a chat: title, description, invite link, photo, ...

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `ChatFullInfo`

#### Example

```python
chat = await bot.get_chat(-1001)
print(chat.title, chat.description, chat.invite_link)
```

:::

::: method
## get_chat_administrators {#get_chat_administrators}
::: head getChatAdministrators | list[ChatMember]
:::
::: sig
await bot.get_chat_administrators(chat_id)
:::

The list of administrators of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `list[ChatMember]`

#### Example

```python
admins = await bot.get_chat_administrators(-1001)
ids = {a.user.id for a in admins}
```

::: warn
Groups/channels only; on a private chat it returns `unsupported peer type`.
:::

:::

::: method
## get_chat_members_count {#get_chat_members_count}
::: head getChatMembersCount | int
:::
::: sig
await bot.get_chat_members_count(chat_id)
:::

The number of members of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `int`

#### Example

```python
count = await bot.get_chat_members_count(-1001)
```

:::

::: method
## get_chat_member {#get_chat_member}
::: head getChatMember | ChatMember
:::
::: sig
await bot.get_chat_member(chat_id, user_id)
:::

Information and status of a member (`creator`, `administrator`, `member`, `restricted`...).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `user_id` | `int` | {req} | Numeric user id |

**Returns:** `ChatMember`

#### Example

```python
member = await bot.get_chat_member(-1001, 12345)
if member.is_admin:
    print("is an admin")
print(member.is_joined)        # has joined?
```

::: tip
`member.is_admin` and `member.is_joined` are library shortcuts. The `IsChatAdmin` and `IsMember` filters use this method.
:::

:::

::: method
## ban_chat_member {#ban_chat_member}
::: head banChatMember | bool
:::
::: sig
await bot.ban_chat_member(chat_id, user_id)
:::

Removes and bans a user from a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `user_id` | `int` | {req} | Numeric user id |

**Returns:** `bool`

#### Example

```python
await bot.ban_chat_member(-1001, 12345)
```

::: note
The bot must be an admin of that chat with the ban right.
:::

:::

::: method
## unban_chat_member {#unban_chat_member}
::: head unbanChatMember | bool
:::
::: sig
await bot.unban_chat_member(chat_id, user_id, only_if_banned=None)
:::

Lifts a user's ban.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `user_id` | `int` | {req} | Numeric user id |
| `only_if_banned` | `bool` | {opt} | `True` = only if the user is actually banned |

**Returns:** `bool`

#### Example

```python
await bot.unban_chat_member(-1001, 12345, only_if_banned=True)
```

:::

::: method
## promote_chat_member {#promote_chat_member}
::: head promoteChatMember | bool
:::
::: sig
await bot.promote_chat_member(chat_id, user_id, *, can_change_info=None, can_post_messages=None,
    can_edit_messages=None, can_delete_messages=None, can_manage_video_chats=None,
    can_invite_users=None, can_restrict_members=None)
:::

Makes a user an admin or changes admin rights. All `can_*` are optional and keyword-only.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `user_id` | `int` | {req} | Numeric user id |
| `can_change_info` | `bool` | {opt} | Change group info |
| `can_post_messages` | `bool` | {opt} | Post messages (channels) |
| `can_edit_messages` | `bool` | {opt} | Edit messages |
| `can_delete_messages` | `bool` | {opt} | Delete messages |
| `can_manage_video_chats` | `bool` | {opt} | Manage video chats |
| `can_invite_users` | `bool` | {opt} | Invite users |
| `can_restrict_members` | `bool` | {opt} | Restrict/ban members |

**Returns:** `bool`

#### Example

```python
await bot.promote_chat_member(-1001, 12345, can_delete_messages=True, can_invite_users=True)
```

:::

::: method
## leave_chat {#leave_chat}
::: head leaveChat | bool
:::
::: sig
await bot.leave_chat(chat_id)
:::

The bot leaves a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `bool`

#### Example

```python
await bot.leave_chat(-1001)
```

:::

::: method
## set_chat_photo {#set_chat_photo}
::: head setChatPhoto | bool
:::
::: sig
await bot.set_chat_photo(chat_id, photo)
:::

Changes the photo of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `photo` | `InputFile` | {req} | Upload only (`FSInputFile`/`BufferedInputFile`) |

**Returns:** `bool`

#### Example

```python
await bot.set_chat_photo(-1001, FSInputFile("logo.jpg"))
```

:::

::: method
## delete_chat_photo {#delete_chat_photo}
::: head deleteChatPhoto | bool
:::
::: sig
await bot.delete_chat_photo(chat_id)
:::

Deletes the photo of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `bool`

#### Example

```python
await bot.delete_chat_photo(-1001)
```

:::

::: method
## set_chat_title {#set_chat_title}
::: head setChatTitle | bool
:::
::: sig
await bot.set_chat_title(chat_id, title)
:::

Changes the title of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `title` | `str` | {req} | Title |

**Returns:** `bool`

#### Example

```python
await bot.set_chat_title(-1001, "Programmers group")
```

:::

::: method
## set_chat_description {#set_chat_description}
::: head setChatDescription | bool
:::
::: sig
await bot.set_chat_description(chat_id, description)
:::

Changes the description of a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `description` | `str` | {req} | Description |

**Returns:** `bool`

#### Example

```python
await bot.set_chat_description(-1001, "Group rules: ...")
```

:::

::: method
## pin_chat_message {#pin_chat_message}
::: head pinChatMessage | bool
:::
::: sig
await bot.pin_chat_message(chat_id, message_id)
:::

Pins a message in the chat.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |

**Returns:** `bool`

#### Example

```python
await bot.pin_chat_message(-1001, 77)
```

**Shortcut:**

```python
await message.pin()
```

:::

::: method
## unpin_chat_message {#unpin_chat_message}
::: head unpinChatMessage | bool
:::
::: sig
await bot.unpin_chat_message(chat_id, message_id)
:::

Unpins a message.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |

**Returns:** `bool`

#### Example

```python
await bot.unpin_chat_message(-1001, 77)
```

**Shortcut:**

```python
await message.unpin()
```

::: note
Bale's docs spell it `unPinChatMessage`; method names are case-insensitive.
:::

:::

::: method
## unpin_all_chat_messages {#unpin_all_chat_messages}
::: head unpinAllChatMessages | bool
:::
::: sig
await bot.unpin_all_chat_messages(chat_id)
:::

Unpins all messages of the chat.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `bool`

#### Example

```python
await bot.unpin_all_chat_messages(-1001)
```

:::

::: method
## create_chat_invite_link {#create_chat_invite_link}
::: head createChatInviteLink | Any
:::
::: sig
await bot.create_chat_invite_link(chat_id)
:::

Creates a new invite link for a group or channel.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `Any`

#### Example

```python
link = await bot.create_chat_invite_link(-1001)
print(link)
```

::: note
Bale's docs do not specify the return type; the library returns the raw reply.
:::

:::

::: method
## revoke_chat_invite_link {#revoke_chat_invite_link}
::: head revokeChatInviteLink | Any
:::
::: sig
await bot.revoke_chat_invite_link(chat_id, invite_link)
:::

Revokes an invite link and returns a new one.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `invite_link` | `str` | {req} | The link to revoke |

**Returns:** `Any`

#### Example

```python
new_link = await bot.revoke_chat_invite_link(-1001, "https://ble.ir/join/abc")
```

:::

::: method
## export_chat_invite_link {#export_chat_invite_link}
::: head exportChatInviteLink | str
:::
::: sig
await bot.export_chat_invite_link(chat_id)
:::

Returns the chat's main invite link.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |

**Returns:** `str`

#### Example

```python
url = await bot.export_chat_invite_link(-1001)
```

:::

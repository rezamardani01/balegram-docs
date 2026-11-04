---
title: متدها: چت و گروه
lead: اطلاعات چت، مدیریت اعضا، تنظیمات گروه، پین و لینک دعوت.
---

بیشتر متدهای این صفحه **فقط برای گروه و کانال** هستند و روی چت خصوصی `unsupported peer type` می‌دهند. ربات برای مدیریت (بن، پین، تغییر عنوان ...) باید **ادمین** باشد.

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`get_chat`](/reference/methods-chats?s=get_chat) | `getChat` | اطلاعات کامل یک چت: عنوان، توضیح، لینک دعوت، عکس و ... |
| [`get_chat_administrators`](/reference/methods-chats?s=get_chat_administrators) | `getChatAdministrators` | فهرست ادمین‌های یک گروه یا کانال. |
| [`get_chat_members_count`](/reference/methods-chats?s=get_chat_members_count) | `getChatMembersCount` | تعداد اعضای گروه یا کانال. |
| [`get_chat_member`](/reference/methods-chats?s=get_chat_member) | `getChatMember` | اطلاعات و وضعیت یک عضو (`creator`، `administrator`، `member`، `restricted`...). |
| [`ban_chat_member`](/reference/methods-chats?s=ban_chat_member) | `banChatMember` | کاربر را از گروه یا کانال اخراج و مسدود می‌کند. |
| [`unban_chat_member`](/reference/methods-chats?s=unban_chat_member) | `unbanChatMember` | مسدودیت کاربر را برمی‌دارد. |
| [`promote_chat_member`](/reference/methods-chats?s=promote_chat_member) | `promoteChatMember` | کاربر را ادمین می‌کند یا دسترسی‌های ادمین را تغییر می‌دهد. |
| [`leave_chat`](/reference/methods-chats?s=leave_chat) | `leaveChat` | ربات از گروه یا کانال خارج می‌شود. |
| [`set_chat_photo`](/reference/methods-chats?s=set_chat_photo) | `setChatPhoto` | عکس گروه یا کانال را تغییر می‌دهد. |
| [`delete_chat_photo`](/reference/methods-chats?s=delete_chat_photo) | `deleteChatPhoto` | عکس گروه یا کانال را حذف می‌کند. |
| [`set_chat_title`](/reference/methods-chats?s=set_chat_title) | `setChatTitle` | عنوان گروه یا کانال را تغییر می‌دهد. |
| [`set_chat_description`](/reference/methods-chats?s=set_chat_description) | `setChatDescription` | توضیحات گروه یا کانال را تغییر می‌دهد. |
| [`pin_chat_message`](/reference/methods-chats?s=pin_chat_message) | `pinChatMessage` | یک پیام را در چت پین می‌کند. |
| [`unpin_chat_message`](/reference/methods-chats?s=unpin_chat_message) | `unpinChatMessage` | پین یک پیام را برمی‌دارد. |
| [`unpin_all_chat_messages`](/reference/methods-chats?s=unpin_all_chat_messages) | `unpinAllChatMessages` | پین همه‌ی پیام‌های چت را برمی‌دارد. |
| [`create_chat_invite_link`](/reference/methods-chats?s=create_chat_invite_link) | `createChatInviteLink` | یک لینک دعوت تازه برای گروه یا کانال می‌سازد. |
| [`revoke_chat_invite_link`](/reference/methods-chats?s=revoke_chat_invite_link) | `revokeChatInviteLink` | یک لینک دعوت را باطل می‌کند و لینک جدید برمی‌گرداند. |
| [`export_chat_invite_link`](/reference/methods-chats?s=export_chat_invite_link) | `exportChatInviteLink` | لینک دعوت اصلی چت را می‌دهد. |

::: method
## get_chat {#get_chat}
::: head getChat | ChatFullInfo
:::
::: sig
await bot.get_chat(chat_id)
:::

اطلاعات کامل یک چت: عنوان، توضیح، لینک دعوت، عکس و ...

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `ChatFullInfo`

#### مثال

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

فهرست ادمین‌های یک گروه یا کانال.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `list[ChatMember]`

#### مثال

```python
admins = await bot.get_chat_administrators(-1001)
ids = {a.user.id for a in admins}
```

::: warn
فقط برای گروه/کانال؛ روی چت خصوصی `unsupported peer type` می‌دهد.
:::

:::

::: method
## get_chat_members_count {#get_chat_members_count}
::: head getChatMembersCount | int
:::
::: sig
await bot.get_chat_members_count(chat_id)
:::

تعداد اعضای گروه یا کانال.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `int`

#### مثال

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

اطلاعات و وضعیت یک عضو (`creator`، `administrator`، `member`، `restricted`...).

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |

**خروجی:** `ChatMember`

#### مثال

```python
member = await bot.get_chat_member(-1001, 12345)
if member.is_admin:
    print("ادمین است")
print(member.is_joined)        # عضو کانال/گروه است؟
```

::: tip
`member.is_admin` و `member.is_joined` میانبرهای کتابخانه‌اند. فیلترهای `IsChatAdmin` و `IsMember` از همین متد استفاده می‌کنند.
:::

:::

::: method
## ban_chat_member {#ban_chat_member}
::: head banChatMember | bool
:::
::: sig
await bot.ban_chat_member(chat_id, user_id)
:::

کاربر را از گروه یا کانال اخراج و مسدود می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |

**خروجی:** `bool`

#### مثال

```python
await bot.ban_chat_member(-1001, 12345)
```

::: note
ربات باید در آن چت ادمین و دارای حق مسدودسازی باشد.
:::

:::

::: method
## unban_chat_member {#unban_chat_member}
::: head unbanChatMember | bool
:::
::: sig
await bot.unban_chat_member(chat_id, user_id, only_if_banned=None)
:::

مسدودیت کاربر را برمی‌دارد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |
| `only_if_banned` | `bool` | {opt} | `True` = فقط اگر واقعاً مسدود است |

**خروجی:** `bool`

#### مثال

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

کاربر را ادمین می‌کند یا دسترسی‌های ادمین را تغییر می‌دهد. همه‌ی `can_*` اختیاری و فقط به‌صورت keyword هستند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |
| `can_change_info` | `bool` | {opt} | تغییر اطلاعات گروه |
| `can_post_messages` | `bool` | {opt} | ارسال پیام (کانال) |
| `can_edit_messages` | `bool` | {opt} | ویرایش پیام‌ها |
| `can_delete_messages` | `bool` | {opt} | حذف پیام‌ها |
| `can_manage_video_chats` | `bool` | {opt} | مدیریت تماس تصویری |
| `can_invite_users` | `bool` | {opt} | دعوت کاربر |
| `can_restrict_members` | `bool` | {opt} | محدود/مسدود کردن اعضا |

**خروجی:** `bool`

#### مثال

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

ربات از گروه یا کانال خارج می‌شود.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `bool`

#### مثال

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

عکس گروه یا کانال را تغییر می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `photo` | `InputFile` | {req} | فقط آپلود (`FSInputFile`/`BufferedInputFile`) |

**خروجی:** `bool`

#### مثال

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

عکس گروه یا کانال را حذف می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `bool`

#### مثال

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

عنوان گروه یا کانال را تغییر می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `title` | `str` | {req} | عنوان |

**خروجی:** `bool`

#### مثال

```python
await bot.set_chat_title(-1001, "گروه برنامه‌نویسان")
```

:::

::: method
## set_chat_description {#set_chat_description}
::: head setChatDescription | bool
:::
::: sig
await bot.set_chat_description(chat_id, description)
:::

توضیحات گروه یا کانال را تغییر می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `description` | `str` | {req} | توضیح |

**خروجی:** `bool`

#### مثال

```python
await bot.set_chat_description(-1001, "قوانین گروه: ...")
```

:::

::: method
## pin_chat_message {#pin_chat_message}
::: head pinChatMessage | bool
:::
::: sig
await bot.pin_chat_message(chat_id, message_id)
:::

یک پیام را در چت پین می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |

**خروجی:** `bool`

#### مثال

```python
await bot.pin_chat_message(-1001, 77)
```

**میانبر:**

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

پین یک پیام را برمی‌دارد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |

**خروجی:** `bool`

#### مثال

```python
await bot.unpin_chat_message(-1001, 77)
```

**میانبر:**

```python
await message.unpin()
```

::: note
نام متد در مستندات بله `unPinChatMessage` نوشته شده؛ نام متدها حساس به حروف نیست.
:::

:::

::: method
## unpin_all_chat_messages {#unpin_all_chat_messages}
::: head unpinAllChatMessages | bool
:::
::: sig
await bot.unpin_all_chat_messages(chat_id)
:::

پین همه‌ی پیام‌های چت را برمی‌دارد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `bool`

#### مثال

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

یک لینک دعوت تازه برای گروه یا کانال می‌سازد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `Any`

#### مثال

```python
link = await bot.create_chat_invite_link(-1001)
print(link)
```

::: note
مستندات بله نوع بازگشتی را مشخص نکرده؛ کتابخونه پاسخ خام را برمی‌گرداند.
:::

:::

::: method
## revoke_chat_invite_link {#revoke_chat_invite_link}
::: head revokeChatInviteLink | Any
:::
::: sig
await bot.revoke_chat_invite_link(chat_id, invite_link)
:::

یک لینک دعوت را باطل می‌کند و لینک جدید برمی‌گرداند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `invite_link` | `str` | {req} | لینکی که باید باطل شود |

**خروجی:** `Any`

#### مثال

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

لینک دعوت اصلی چت را می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |

**خروجی:** `str`

#### مثال

```python
url = await bot.export_chat_invite_link(-1001)
```

:::

---
name: bland-setup-api-key
description: >
  Set up and validate a Bland AI API key for voice agent development.
  Use when the user wants to authenticate with Bland AI or needs to configure their API key.
user-invocable: true
---

# Setting Up Your Bland AI API Key

## Automatic Setup (Preferred)

Use the `bland_auth_login` tool. This will:
1. Open the user's browser to the Bland AI signup/login page
2. Wait for them to complete authentication
3. Automatically save the API key to their local config
4. Return the provisioned phone number and persona (for new signups)

If the tool returns `already_authenticated`, the user is good to go — skip to validation.

If the tool returns `status: "authenticated"`, confirm to the user that setup is complete and mention their provisioned phone number if one was returned.

## Manual Fallback

If `bland_auth_login` fails (timeout, port issues, browser won't open), fall back to manual setup:

1. Tell the user to visit **https://app.bland.ai** and create an account
2. After signup, navigate to **Settings > API Keys** and copy the key (starts with `org_`)
3. Ask the user to paste their API key
4. Save it by telling the user to set the environment variable:
   ```bash
   export BLAND_API_KEY="org_your_key_here"
   ```
   Or store it in their shell profile (`~/.bashrc`, `~/.zshrc`) for persistence.

## Validation

After setup (automatic or manual), validate the key works by calling `bland_call_list` with `limit: 1`.

- **Success**: Returns a list (even if empty) — the key is valid
- **401 error**: Key is invalid — ask the user to try again
- **403 error**: Key lacks permissions — user may need to check their org settings

## Billing Issues

If the user encounters billing-related errors when making calls, direct them to **https://app.bland.ai** to add payment details under **Settings > Billing**. The initial setup provides a free phone number and persona, but usage beyond the free tier requires billing setup.

# Discord Message Search Cleaner (JS)

A fast, reliable Discord **message cleaner powered by the search system**, with safe rate-limit handling and clean console output.  
Deletes **your own messages only** and works globally across **servers, DMs, and group DMs**.

---

## Update Log

### Latest Update (December 2025)

- Built as a **browser-based JavaScript tool**
- Uses Discord’s **search pagination system** (not channel history)
- Full support for:
  - Servers
  - DMs
  - Group DMs
- Safe, serialized deletion (one message at a time)
- Fixed **10s rate-limit backoff** on 429 responses
- Automatic retry after rate limits
- Cursor + offset pagination to **avoid skipped messages**
- Skips undeletable system / call messages cleanly
- Clean, readable console output with progress tables
- No dependencies, no installs, no Python required

---

## Requirements

- **Desktop browser** (Chrome / Chromium recommended)
- **Discord Web**
- **Vencord Web extension**
- A Discord **user token**

---

## Installation & Setup

### 1. Install Vencord Web
Install the Vencord Web extension:

https://chromewebstore.google.com/detail/vencord-web/cbghhgpcnddeihccjmnadmkaejncjndb

<img width="677" height="308" alt="image" src="https://github.com/user-attachments/assets/261369bc-1751-4bf8-a95f-df07408c3194" />

---

### 2. Open Discord Web
Navigate to:

https://discord.com/app

Log into your account.

---

### 3. Enable Experiments
1. Open **Discord Settings**
2. Go to **Plugins**
3. Enable **Experiments**
4. Reload Discord

<img width="814" height="266" alt="image" src="https://github.com/user-attachments/assets/917801b0-a4f8-4809-897d-6f0928c433ca" />

---

### 4. Enable xDM Search (Required)
1. Go to **Settings → Experiments**
2. Find **Search Desktop XDM**
3. Set it to:

Treatment 1: Enables xDM search

<img width="799" height="173" alt="image" src="https://github.com/user-attachments/assets/700dc337-483d-4437-aa28-bd0457fa0cc5" />

4. Reload Discord again

This step is required to allow **searching across all DMs**.

---

## How to Use

### 1. Go to Any DM
Open **any DM** (recommended).

---

### 2. Run a Search
In the search bar, type:

from:your_discord_username

Then:
- Click the **settings (gear) icon**
- Enable **Search all DMs**

<img width="438" height="199" alt="image" src="https://github.com/user-attachments/assets/ae77fd38-be43-4211-83c5-d05c55e2490e" />

This creates the global search result set.

---

### 3. Open DevTools
Press:

Ctrl + Shift + I

Go to the **Console** tab.

---

### 4. Run the Script
Paste the script from this repository into the console and press **Enter**.

You should see:

Waiting for message search

---

### 5. Trigger the Search Again
Run the **same search again**:

from:your_discord_username

When results load:
- You will be prompted for your **token**
- Paste it
- Deletion starts automatically

---

## What the Script Does

- Deletes **only messages authored by your account**
- Never touches other users’ messages
- Uses Discord’s **search pagination**, not message history
- Automatically advances pages without skipping messages
- Applies a fixed **10 second delay on rate limits**
- Retries safely after each rate limit

Example output:

✓ Deleted 1431223367901646888  
✓ Deleted 1431223329141952604  
⚠ Rate limited — sleeping 10s  
✓ Deleted 1431223285122727936  

---

## Stopping the Script

To stop immediately, run this in the console:

```js
running = false
```

---

## Skipped / Failed Messages

Messages that could not be deleted are stored in:

```js
window.__MSG_WIPE_SKIPPED__
```

This includes:
- System messages
- Call logs
- Messages in inaccessible channels

---

## Important Notes

- Only **your messages** are deleted
- System and call messages cannot be deleted
- Designed for **large histories** (hundreds of thousands of messages)
- Runs entirely in the browser — no files are written

---

## DO NOT SHARE YOUR TOKEN

Your Discord token gives **full access** to your account.

- Never share your token
- Never commit it to GitHub
- If leaked:
  - Log out of Discord immediately, **or**
  - Change your Discord password to invalidate the token

---

## Disclaimer

THIS SOFTWARE AND ALL INFORMATION PROVIDED ARE OFFERED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

By using this software, you agree to all parts of this disclaimer.

---

**Last updated & tested: December 2025**

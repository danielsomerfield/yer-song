# Functional Items

## Persona: Submitter

### View: Home ✔︎
#### Action: Back to Browse ✔︎
#### Action: Back to Playlist ✔︎
#### Action: Register ✔︎
* Not giving feedback yet on registration success / failure
* Not yet validating that user is registered to let them do other things ✔︎
* Return key submits form

### View: Genre List (Browse) ✔︎
#### Action: Back to Playlist
#### Action: Go to Songs for Genre ✔︎
* Handle load failures
* Scrolling for when there are more genres

### View: Song for Genre ✔︎︎ ︎

#### Action: Back to Playlist ✔︎
#### Action: Back to Browse ✔︎  
#### Action: Go to Song Details ✔︎
* Handle missing tag case (MVP)
* Message if no songs found  ✔︎
* Handle load failures (MVP)

### View: Song Details ✔︎
* Handle load failures (MVP)
* Show status (on play list / not on playlist) ✔︎
#### Action: Back to Browse ✔︎
#### Action: Back to Playlist︎ ✔︎
#### Action: Add to playlist / Upvote ✔︎
#### Action: Go back to playlist or browse ✔︎
  - Clean up "back" hack
#### Misc
- Refresh on playlist change (MVP)
- On vote, update button text ✔︎
- Enforce vote limit ✔︎
- Limit how many times song can be queued

### View: Registration (on home page) ✔︎︎ ︎
#### Action: Submit registration ✔︎
* Disallow name that has already been used

### View: Playlist ✔︎
#### Action: Up vote  ✔︎
#### Action: Back to Browse ✔︎
#### Action: Back to Song on click ✔︎
* Refresh on playlist change (MVP) ✔︎
* Handle load failures (MVP)
* Show who originally added  ✔︎


## Persona: Admin
### View: Playlist (with control) ✔︎
* Show who voted for what
#### Action: Move up ✔︎
#### Action: Move down ✔︎
#### Action: Remove (Mark as played)  ✔︎
#### Bugs
* Not scrolling when list is large ✔︎
* Songs with the same vote count can't be reliably pushed up and down

### Persona: Playlist view (projection) ✔︎
### View: Playlist ✔︎
* New songs aren't last (necessarily) because of natural song sort order when vote count is the same
* Get rid of mouse-over ︎  ✔︎

## Tasks
* Add complete song list (for wedding)  ✔︎
* Theme  ✔︎

## General
* CORS headers for error conditions (MVP)
* Filter out (rather than fail) bad data in DB (MVP)
* General error handler for failures (MVP)
* Log in as admin  (MVP)
* Better loading view  (MVP)
* Add error boundaries  (MVP)
* Refreshes when playlist changes (MVP) ✔︎
* Push user to registration page if not registered (MVP) ✔︎
* Show toast when something changes (like a vote)
  * Playlist vote ✔︎
  * Song view vote ✔︎

## Future General
* Caches
* More consistent accessibility
* Song and genre pagination
* Nav:
  * hide or disable buttons on the page you are on already

# Refactor
- Extract list component

# Automation
* Generate API DNS so hard-coded value in .env file and Makefile can be replaced
* Because AWS SAM is lame, it's very hard to re-use table definitions in:
  1. tests
  2. production deploy
  3. local deploy
  As a result there's a lot of redundancy in the tables. There has to be a way to fix this.

# Testing
* validate that all lambdas return the required headers - could be one test re-applied

# Tuning
* find the right level of throughput for tables and indexes

## DB Schema
* Create a smarter partitioning scheme for Song (and maybe entities), then create id lookups via a GSI

## Known bugs
* if two songs have the same number of votes they are ordered by the key meaning they can jump unexpectedly when added or voted
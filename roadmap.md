# Functional Items

## Persona: Submitter

### View: Home ✔︎
#### Action: Back to Browse ✔︎
#### Action: Back to Playlist ✔︎
* hidden if not registered
#### Action: Register

### View: Genre List (Browse) ✔︎
#### Action: Back to Playlist
#### Action: Go to Songs for Genre ✔︎
* Handle load failures

### View: Song for Genre ✔︎︎ ︎
* Handle load failures
#### Action: Back to Playlist ✔︎
#### Action: Back to Browse ✔︎  
#### Action: Go to Song Details ✔︎
* Handle missing tag case
* Message if no songs found
* Handle load failures

### View: Song Details ✔︎
* Handle load failures
* Show status (on play list / not on playlist)
#### Action: Back to Browse ✔︎
#### Action: Back to Playlist︎ ✔︎
#### Action: Add to playlist / Upvote ✔︎
- Enforce vote limit
  - Requires registration
- Limit how many times song can be queued (possibly not MVP)

### View: Registration
#### Action: Submit registration

### View: Playlist ✔︎
#### Action: Up vote 
#### Action: Back to Browse ✔︎
#### Action: Back to Song on click
* Handle load failures

## Persona: Moderator
### View: Playlist (with control)
* Show who voted for what (possibly not MVP)
#### Action: Move up
#### Action: Move down
#### Action: Mark as played


### Persona: Playlist view (projection)
### View: Playlist

## Tasks
* Add complete song list
* Theme

## General
* Refreshes when playlist changes (MVP)
* Filter out (rather than fail) bad data in DB (MVP)
* General error handler for failures (MVP)
* Push user to registration page if not registered (MVP)
* Log in as admin  (MVP)
* Better loading view  (MVP)
* Add error boundaries  (MVP)
* Caches (not MVP)

## Music generes:
- classic pop/rock
- contemporary
- movie/stage
- jazz

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
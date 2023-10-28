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
#### Action: Back to Browse ✔︎
#### Action: Back to Playlist︎ ✔︎
#### Action: Add to playlist
- Enforce vote limit
- Only show if not on playist
#### Action: Up vote
- Enforce vote limit
- Only show if on playist

### View: Registration
#### Action: Submit registration

### View: Playlist ✔︎
#### Action: Up vote
#### Action: Back to Browse

## Persona: Moderator
### View: Playlist (with control)
#### Action: Move up
#### Action: Move down
#### Action: Remove

### Persona: Playlist view (projection) d
### View: Playlist

## Tasks
* Add complete song list
* Theme

## General
* Push user to registration page if not registered
* Log in as admin
* Better loading view
* Add error boundaries
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
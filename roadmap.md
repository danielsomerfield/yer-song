# Functional Items

## Persona: Submitter

### View: Home ✔︎
#### Action: Back to Browse
* hidden if not registered
#### Action: Register

### View: Genre List ✔︎
#### Action: Go to Songs for Genre ✔︎
* Handle load failures
* 

### View: Song by Genre ✔︎︎ ︎
* Handle load failures
#### Action: Back to Browse ✔︎  
#### Action: Go to Song Details ✔︎
* Handle missing tag case
* Message if no songs found
* Handle load failures

### View: Song Details ✔︎
* Handle load failures
#### Action: Back to Browse ✔︎ ︎
#### Action: Add to playlist
- Enforce vote limit
- Only show if not on playist
#### Action: Up vote
- Enforce vote limit
- Only show if on playist

### View: Registration
#### Action: Submit registration

### View: Playlist
#### Action: Up vote

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

## Music generes:
- classic pop/rock
- contemporary
- movie/stage
- jazz

# Refactor
- Extract list component

# Automation
* Generate API DNS so hard-coded value in .env file and Makefile can be replaced

# Current

## Social login support

### Global access via SSO provider (social login)
As a would-be user of yer-song, I should be able to use a social provider to log in to the site. At this stage, it will
be universal access to all the things. As a result of social login, we will store the user's name and email.

# Backlog

## Persona: Submitter

### View: Home
* Not giving feedback yet on registration success / failure

### View: Genre List (Browse) 
* Handle load failures
* Scrolling for when there are more genres

### View: Song for Genre
* Handle load failures 

### View: Song Details 
* Handle load failures
  - Clean up "back" hack

#### Misc
- Refresh on playlist change
- Opacity on button click
- Limit how many times song can be queued

### View: Registration (on home page)
* Disallow name that has already been used

### View: Playlist
* Handle load failures

## Persona: Admin
### View: Playlist (with control)
* Show who voted for what

### Persona: Playlist view (projection) ✔︎
### View: Playlist ✔︎
* New songs aren't last (necessarily) because of natural song sort order when vote count is the same

## General
 
* Filter out (rather than fail) bad data in DB 
* General error handler for failures 
* Log in as admin  
* Better loading view  

## Future General
* More consistent accessibility
* Nav:
  * hide or disable buttons on the page you are on already

# Automation
* Convert from AWS SAM to terraform. SAM isn't... good.
* Generate API DNS so hard-coded value in .env file and Makefile can be replaced
* Because AWS SAM is lame, it's very hard to re-use table definitions in:
  1. tests
  2. production deploy
  3. local deploy
  As a result there's a lot of redundancy in the tables. There has to be a way to fix this.
* Make target that does entire AWS deploy
* Make target that does entire local deploy

# Tuning
* find the right level of throughput for tables and indexes
* Song and genre pagination from DB
* Caching to reduce latency

## DB Schema
* Create a smarter partitioning scheme for Song (and maybe entities), then create id lookups via a GSI

## Known bugs
* if two songs have the same number of votes they are ordered by the key meaning they can jump unexpectedly when added or voted
* not all error cases return consistent CORS headers for error conditions so you don't get any browser feedback

# Feature ideas
## Registration
* Social login
* Email

## Multi-tenant support
## Ability to charge for requests (Venmo, etc)
## Configurable "seed" upload

## Configuration
* Allow user to see playlist without registration
* Allow user to see song list without registration
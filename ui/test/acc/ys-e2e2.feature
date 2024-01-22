Feature: e2e

  Scenario: votes for a song and song appears in playlist
    Given driver 'https://yersong.danielsomerfield.com'
    And input('#name', 'AccTestE2E')
    And waitForEnabled('{Button}Register').click()
#    And waitFor('{div}.role("list")')
#    And waitUntil("attribute('#root', 'aria-hidden') != 'true'")
#    And waitUntil("!exists('{Button}Register')")
#    And waitUntil("!exists(attribute('#root', 'aria-hidden'))")
## TODO sync on being able to click Browse

    When delay(3000).click('{Button}Browse')

#    And retry(3, 3000).click('{Button}Browse')
#    And click('{Button}Browse')
    And waitFor('{div}Contemporary').click()
    And waitFor('{div}Holy').click()
    And waitFor('{Button}Up vote').click()
    And waitFor('{div}Your vote has been added')

    Then click('{Button}Playlist')
    And waitFor('{div}Holy')
## TODO: match on something so we know our vote was counted.
#    And match enabled('//button[../../div="Holy"]') == false
#    And match enabled('//div[text()="Holy"]/following-sibling::div/button') == false
#    And match enabled(locate('{div}Holy').nextSibling) == false

'''
This will take a file named 'contemporary.txt' with the following format:

"
A Sky Full of Stars (Coldplay)
A Thousand Years (Christina Perri)
Adore You (Harry Styles)
...
"

And convert it to a csv file with the format:

A Sky Full of Stars,Coldplay,Contemporary (This century)
A Thousand Years,Christina Perri,Contemporary (This century)
Adore You,Harry Styles,Contemporary (This century)

Note: Converted csv files will need to be cleaned up manually where band or song names have commas in them.
Comma's are turned to semicolons. Afterwards, you'll need to quote the item and change them back to commas
if you'd like.
'''

import csv

text_file_list = ['classic-pop', 'contemporary', 'jazz-love', 'screen']
genre_hash = {
        "classic-pop": "Classic Pop & Rock (Last century)",
        "contemporary": "Contemporary (This century)",
        "jazz-love": "Jazz Standards & Old Love Songs",
        "screen": "Movie, TV, and Stage"
        }

for genre in text_file_list:
    with open(f"{genre}.txt", 'r') as file:
        data = file.read()
        data = data.replace('&amp;', '&')
        data = data.replace('&#39;', "'")
        data = data.replace('&quot;', '"')
        data = data.replace(',', ';')
        data = data.replace(' (', ', ')
        data = data.replace(')', '')
        
        data = data.splitlines()
        trimmed_data = [[f'{phrase.strip()}' for phrase in line.split(',')] for line in data]
        
        current_genre = genre_hash[genre]
        for line in trimmed_data:
            line.append(current_genre)
        
        with open(f"{genre}.csv", 'w') as csv_file:
            writer = csv.writer(csv_file)
            for row in trimmed_data:
                writer.writerow(row)

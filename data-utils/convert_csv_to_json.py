import csv
import json
import uuid

data_directory = '../seed'

# combine csv files: this will combine the files below into "all_songs.csv"
csv_files = ['classic-pop-touched.csv', 'contemporary-touched.csv', 'jazz-love-touched.csv', 'screen-touched.csv']

with open('all_songs.csv', 'w') as songs_file:
    for file in csv_files:
        with open(file, 'r') as current_file:
            content = current_file.read()
            songs_file.write(content)            
        
# building the json from the csv file
song = []

genres = ['Classic Pop & Rock (Last century)', 'Contemporary (This century)', 'Jazz Standards & Old Love Songs', 'Movie, TV, and Stage']
genre_tags = {
        'Classic Pop & Rock (Last century)': 'ClassicPopRock',
        'Contemporary (This century)': 'Contemporary',
        'Jazz Standards & Old Love Songs': 'JazzOldLove',
        'Movie, TV, and Stage' : 'MovieTVStage'
        }

# add genre mapping to the data first
for genre in genres:
    item = {
            "PutRequest": {
                "Item": {
                    "PK": {
                        "S": "t:genre"
                        },
                    "SK": {
                        "S": f"t:genre:{genre_tags[genre]}"
                        },
                    "entityType": {
                        "S": "tag" 
                        },
                    "tag": {
                        "S": f"genre:{genre}"
                        }
                }
            }}
    song.append(item)

# convert the song data to json
with open('all_songs.csv') as csv_file:
    file_count = 0
    csv_reader = csv.reader(csv_file, delimiter=',')
    for row in csv_reader:
        song_name, artist_name, song_genre = row
        item_id = str(uuid.uuid4())
        item = {
                "PutRequest": {
                    "Item": {
                        "PK": {
                            "S": f"s:{item_id}"
                            },
                        "SK": {
                            "S": f"s:{item_id}"
                            },
                        "entityType": {
                            "S": "song"
                            },
                        "requests": {
                            "M": {}
                            },
                        "GSI1PK": {
                            "S": f"t:genre:{genre_tags[row[2]]}"
                            },
                        "title": {
                            "S": song_name
                            },
                        "artistName": {
                            "S": artist_name
                            }
                        }
                    }
                }
        song.append(item)

        # write to a file every 25 songs (25 is the Dynamo batch limit)
        if len(song) >= 25:
            with open(f"{data_directory}/data{file_count}.json", "w") as json_file:
                json_file.write(json.dumps({"song": song}))
            song = []
            file_count += 1

    # any leftover songs are written to a file
    with open(f"{data_directory}/data{file_count}.json", "w") as json_file:
        json_file.write(json.dumps({"song": song}))

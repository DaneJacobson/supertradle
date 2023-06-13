import requests

import pandas as pd

iframe_str = 'https://oec.world/en/visualize/embed/tree_map/hs92/export/%s/%s/show/2021/?controls=false&title=false&click=false'

df = pd.read_csv('./public/data.csv')
all_countries = df.loc[:, 'country'].to_list()
print(len(all_countries))

pairings = []
for fromIdx in range(len(all_countries)):
    for toIdx in range(fromIdx + 1, len(all_countries)):
        pairings.append([all_countries[fromIdx], all_countries[toIdx]])

# print(len(pairings))

# legit_pairings = []
# for pairing in pairings:
#     iframe = requests.get(iframe_str % ('gib', 'usa'))
#     if 'svg' in iframe:
#         legit_pairings.append(pairing)
import requester as r
import checker as c
import league_requests as l
import user_requests as u
import team_requests as t
import json

c.desc = '#### initialize session'
session_response = u.signin('admin', 'admin')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

##### HAPPY PATH #####

### Create user and league
res = u.create_user('rahul', 'pw')
user_id = json.loads(res.content)['results']['insertId']
res = u.create_user('nik', 'pw')
user_id2 = json.loads(res.content)['results']['insertId']
res = l.create("NECK", 10, 16, 207, 'AUCTION')
league_id = json.loads(res.content)['results']['insertId']

c.desc = '#### create team for rahul in NECK'
res = t.create("PIGGIES", user_id, league_id, 207)
c.check(res.status_code == 200)
id = json.loads(res.content)['results']['insertId']

c.desc = '#### team name == PIGGIES'
res = t.get(id)
c.check(res.status_code == 200)
c.check(json.loads(res.content)['results']['name'] == 'PIGGIES')

c.desc = '#### update team'
res = t.update(id, "REX", user_id, league_id, 201)
c.check(res.status_code == 200)

c.desc = '#### new team name == REX'
res = t.get(id)
c.check(res.status_code == 200)
c.check(json.loads(res.content)['results']['name'] == 'REX')

c.desc = '#### get all teams in league'
res = l.get_teams(league_id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 1)

c.desc = '#### create another team in league and verify'
res = t.create("ELI", user_id2, league_id, 207)
c.check(res.status_code == 200)
res = l.get_teams(league_id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)

c.desc = '#### get all available players in league'
res = l.get_available_players(league_id)
c.check(res.status_code == 200)
total_num_players = len(json.loads(res.content)['results'])

c.desc = '#### add player to team'
res = t.add_player(id, 1, 20, 1)
c.check(res.status_code == 200)

c.desc = '#### player exists on team'
res = t.get_players(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 1)
c.check(json.loads(res.content)['results'][0]['cost'] == 20)

c.desc = '#### get all available players in league returns correct number'
res = l.get_available_players(league_id)
c.check(res.status_code == 200)
c.check(total_num_players - 1 == len(json.loads(res.content)['results']))

c.desc = '#### add another player to team'
res = t.add_player(id, 2, 30, 2)
c.check(res.status_code == 200)

c.desc = '#### both players now exist on team'
res = t.get_players(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)
c.check(json.loads(res.content)['results'][0]['cost'] == 30)
c.check(json.loads(res.content)['results'][1]['cost'] == 20)

c.desc = '#### get all available players in league returns correct number'
res = l.get_available_players(league_id)
c.check(res.status_code == 200)
c.check(total_num_players - 2 == len(json.loads(res.content)['results']))

## add 2 more players to team
res = t.add_player(id, 3, 30, 3)
res = t.add_player(id, 4, 30, 4)
res = l.get_available_players(league_id)
c.check(total_num_players - 4 == len(json.loads(res.content)['results']))

c.desc = 'reset draft to draft_position 2'
res = l.reset_to_position(league_id, 2)
c.check(res.status_code == 200)
res = l.get_available_players(league_id)
c.check(total_num_players - 2 == len(json.loads(res.content)['results']))

c.desc = '#### remove first player from team'
res = t.remove_player(id, 1)
c.check(res.status_code == 200)

c.desc = '#### only second player exists on team'
res = t.get_players(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 1)
c.check(json.loads(res.content)['results'][0]['cost'] == 30)

c.desc = '#### get all available players in league returns correct number'
res = l.get_available_players(league_id)
c.check(res.status_code == 200)
c.check(total_num_players - 1 == len(json.loads(res.content)['results']))

c.desc = '#### delete team'
res = t.delete(id)
c.check(res.status_code == 200)

c.desc = '#### team no longer exists'
res = t.get(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 0)

c.desc = '#### get all available players in league returns correct number'
res = l.get_available_players(league_id)
c.check(res.status_code == 200)
c.check(total_num_players == len(json.loads(res.content)['results']))

c.finish("Teams")

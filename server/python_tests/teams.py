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

c.desc = '#### delete team'
res = t.delete(id)
c.check(res.status_code == 200)

c.desc = '#### team no longer exists'
res = t.get(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 0)

c.finish("Teams")

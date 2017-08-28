import requester as r
import checker as c
import league_requests as l
import user_requests as u
import team_requests as t
import draft_requests as d
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

res = t.create("PIGGIES", user_id, league_id, 207)
team_id1 = json.loads(res.content)['results']['insertId']

res = t.create("ELI", user_id2, league_id, 207)
team_id2 = json.loads(res.content)['results']['insertId']

c.desc = '#### start draft'
res = d.start(league_id)
c.check(res.status_code == 200)

c.desc = '#### login as rahul'
res = u.signout()
session_response = u.signin('rahul', 'pw')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### nominate player'
res = d.nominate_player(league_id, 1, 10)
c.check(res.status_code == 200)

c.desc = '#### login as nik'
res = u.signout()
session_response = u.signin('nik', 'pw')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### place bid'
res = d.place_bid(league_id, team_id2, 11)
c.check(res.status_code == 200)

c.desc = '#### login as admin'
res = u.signout()
session_response = u.signin('admin', 'admin')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### get state'
res = d.state(league_id)
c.check(res.status_code == 200)
# print json.loads(res.content)

c.desc = '#### pause draft'
res = d.pause(league_id)
c.check(res.status_code == 200)

c.desc = '#### resume draft'
res = d.resume(league_id)
c.check(res.status_code == 200)

c.desc = '#### get state'
res = d.state(league_id)
c.check(res.status_code == 200)
# print json.loads(res.content)

c.desc = '#### reset round'
res = d.reset_round(league_id)
c.check(res.status_code == 200)

c.desc = '#### get state'
res = d.state(league_id)
c.check(res.status_code == 200)
# print json.loads(res.content)

c.finish("Drafts")

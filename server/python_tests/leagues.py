import requester as r
import checker as c
import league_requests as l
import user_requests as u
import json

c.desc = '#### initialize session'
session_response = u.signin('admin', 'admin')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

##### HAPPY PATH #####

c.desc = '#### create league'
res = l.create("SEEN", 10, 16, 207, 'AUCTION')
c.check(res.status_code == 200)
id = json.loads(res.content)['results']['insertId']

c.desc = '#### league name == SEEN'
res = l.get(id)
c.check(res.status_code == 200)
c.check(json.loads(res.content)['results']['name'] == 'SEEN')

c.desc = '#### update league'
res = l.update(id, "NECK", 12, 17, 200, 'SNAKE')
c.check(res.status_code == 200)

c.desc = '#### new league name == NECK'
res = l.get(id)
c.check(res.status_code == 200)
c.check(json.loads(res.content)['results']['name'] == 'NECK')

c.desc = '#### delete league'
res = l.delete(id)
c.check(res.status_code == 200)

c.desc = '#### league no longer exists'
res = l.get(id)
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 0)

c.finish("Leagues")

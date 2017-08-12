import requester as r
import checker as c
import user_requests as u
import json

c.desc = '#### get user before session is initialized'
res = u.get_user()
c.check(res.status_code == 401)

c.desc = '#### initialize session'
session_response = u.signin('admin', 'admin')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### get user after session is initialized'
res = u.get_user()
c.check(res.status_code == 200)
c.check(json.loads(res.content)['username'] == 'admin')
c.check(json.loads(res.content)['id'] == 1)

c.desc = '#### create user with invalid input -- null username'
res = u.create_user(None, "abcd")
c.check(res.status_code > 400)

# c.desc = '#### create user with invalid input -- empty username, present pw'
# res = u.create_user('', 'abcd')
# c.check(res.status_code > 400)

c.desc = '#### admin user exists'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 1)
c.check(json.loads(res.content)['results'][0]['username'] == 'admin')

c.desc = '#### create user with valid input -- present username, present pw'
res = u.create_user('rahul', 'pw')
c.check(res.status_code == 200)

c.desc = '#### rahul exists'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)
c.check(json.loads(res.content)['results'][1]['username'] == 'rahul')

c.desc = '#### update user with invalid input -- null username'
res = u.update_user(None)
c.check(res.status_code > 400)

c.desc = '#### update user with valid input -- present username'
res = u.update_user('rahul')
c.check(res.status_code == 200)

c.desc = '#### rahul is updated to the same username'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)
c.check(json.loads(res.content)['results'][1]['username'] == 'rahul')

c.desc = '#### update user with valid input -- present username, newUsername'
res = u.update_user('rahul', 'rahulUpdated')
c.check(res.status_code == 200)

c.desc = '#### rahuls username is updated'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)
c.check(json.loads(res.content)['results'][1]['username'] == 'rahulUpdated')

c.desc = '#### update user with valid input -- present username, password'
res = u.update_user('rahul', None, "pwUpdated")
c.check(res.status_code == 200)

c.desc = '#### update user with valid input -- present username, newUsername, password'
res = u.update_user('rahulUpdated', 'rahulUpdated2', "pwUpdated2")
c.check(res.status_code == 200)

c.desc = '#### rahul is updated again'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 2)
c.check(json.loads(res.content)['results'][1]['username'] == 'rahulUpdated2')

c.desc = '#### signout and login as rahulUpdated2'
res = u.signout()
c.check(res.status_code == 200)
session_response = u.signin('rahulUpdated2', 'pwUpdated2')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### get user as rahul after session is initialized'
res = u.get_user()
c.check(res.status_code == 200)
c.check(json.loads(res.content)['username'] == 'rahulUpdated2')
c.check(json.loads(res.content)['id'] == 2)

c.desc = '#### signout and login back in as admin'
res = u.signout()
c.check(res.status_code == 200)
session_response = u.signin('admin', 'admin')
c.check(session_response.status_code == 200)
r.session = session_response.cookies

c.desc = '#### delete user'
res = u.delete_user('rahulUpdated2')
# print json.loads(res.content)
c.check(res.status_code == 200)

c.desc = '#### rahul is deleted'
res = u.get_all_users()
c.check(res.status_code == 200)
c.check(len(json.loads(res.content)['results']) == 1)
c.check(json.loads(res.content)['results'][0]['username'] == 'admin')

# TODO: revisit this return structure once we can add users to teams, teams to leagues
c.desc = '#### get league ids for admin'
res = u.get_league_ids()
c.check(res.status_code == 200)
c.check(json.loads(res.content)['results'][0]['id'] == None)

c.finish("Users")

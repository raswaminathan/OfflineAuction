import requester as r

def signin(username, password):
  params = {
    'username': username,
    'password': password
  }
  return r.send_request('/user/signin', 'POST', params)

def signout():
  return r.send_request('/user/signout', 'POST', {})

def create_user(username, password):
  params = {
    'username':username,
    'password':password
  }
  return r.send_request('/user', 'PUT', params)

def update_user(username, newUsername = None, password = None):
  params = {
    'username': username
  }
  if password:
    params['password'] = password
  if newUsername:
    params['newUsername'] = newUsername

  return r.send_request('/user', 'POST', params)

def get_user():
  return r.send_request('/user', 'GET', {})

def get_all_users():
  return r.send_request('/user/all', 'GET', {})

def delete_user(username):
  return r.send_request('/user/delete', 'POST', {'username': username})

def get_league_ids():
  return r.send_request('/user/getLeagueIds', 'GET', {})

import requester as r

def create(name = None, user_id = None, league_id = None, money_remaining = None):
  params = {}
  if name:
    params['name'] = name
  if user_id:
    params['user_id'] = user_id
  if league_id:
    params['league_id'] = league_id
  if money_remaining:
    params['money_remaining'] = money_remaining
  return r.send_request('/team', 'PUT', params)

def update(id, name = None, user_id = None, league_id = None, money_remaining = None):
  params = {
    'id': id
  }
  if name:
    params['name'] = name
  if user_id:
    params['user_id'] = user_id
  if league_id:
    params['league_id'] = league_id
  if money_remaining:
    params['money_remaining'] = money_remaining

  return r.send_request('/team', 'POST', params)

def delete(id):
  return r.send_request('/team', 'DELETE', {'id': id})

def get(id):
  return r.send_request('/team', 'GET', {'id': id})

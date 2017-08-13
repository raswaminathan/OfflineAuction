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

def add_player(team_id, player_id, cost, draft_position):
  params = {
    'team_id': team_id,
    'player_id': player_id,
    'cost': cost,
    'draft_position': draft_position
  }

  return r.send_request('/team/addPlayer', 'POST', params)

def remove_player(team_id, player_id):
  params = {
    'team_id': team_id,
    'player_id': player_id
  }

  return r.send_request('/team/removePlayer', 'POST', params)

def get_players(team_id):
  return r.send_request('/team/players', 'GET', {'team_id': team_id})

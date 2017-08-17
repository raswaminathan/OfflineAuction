import requester as r

def start(league_id):
  return r.send_request('/draft/start', 'POST', {'league_id': league_id})

def nominate_player(league_id, player_id, starting_bid):
  params = {
    'league_id': league_id,
    'player_id': player_id,
    'startingBid': starting_bid
  }
  return r.send_request('/draft/nominatePlayer', 'POST', params)

def place_bid(league_id, team_id, bid):
  params = {
    'league_id': league_id,
    'team_id': team_id,
    'bid': bid
  }
  return r.send_request('/draft/placeBid', 'POST', params)

def state(league_id):
  return r.send_request('/draft/state', 'GET', {'league_id': league_id})

def pause(league_id):
  return r.send_request('/draft/pause', 'POST', {'league_id': league_id})

def resume(league_id):
  return r.send_request('/draft/resume', 'POST', {'league_id': league_id})

def reset_round(league_id):
  return r.send_request('/draft/resetRound', 'POST', {'league_id': league_id})

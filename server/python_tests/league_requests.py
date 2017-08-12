import requester as r

def create(name = None, num_teams = None, num_positions = None, salary_cap = None, draft_type = None):
  params = {}
  if name:
    params['name'] = name
  if num_teams:
    params['num_teams'] = num_teams
  if num_positions:
    params['num_positions'] = num_positions
  if salary_cap:
    params['salary_cap'] = salary_cap
  if draft_type:
    params['draft_type'] = draft_type
  return r.send_request('/league', 'PUT', params)

def update(id, name = None, num_teams = None, num_positions = None, salary_cap = None, draft_type = None):
  params = {
    'id': id
  }
  if name:
    params['name'] = name
  if num_teams:
    params['num_teams'] = num_teams
  if num_positions:
    params['num_positions'] = num_positions
  if salary_cap:
    params['salary_cap'] = salary_cap
  if draft_type:
    params['draft_type'] = draft_type

  return r.send_request('/league', 'POST', params)

def delete(id):
  return r.send_request('/league', 'DELETE', {'id': id})

def get(id):
  return r.send_request('/league', 'GET', {'id': id})

def getAll():
  return r.send_request('/league/all', 'GET', {})  